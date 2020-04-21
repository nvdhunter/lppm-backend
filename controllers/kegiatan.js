const HTTPStatus = require("http-status");
const { __getAll: getAllPeriode } = require("./periode");
const { toAssocCompositeKey } = require("../helper-functions");

const KEGIATAN_REVIEWER_STATUS = `
  SELECT
    keg.id_kegiatan,
    COUNT(kegr.id_kegiatan_reviewer) AS total_reviewer,
    SUM(!(ISNULL(kegf4.id_kegiatan_reviewer) OR ISNULL(kegg4.id_kegiatan_reviewer))) AS total_reviewed_04,
    SUM(!(ISNULL(kegf7.id_kegiatan_reviewer) OR ISNULL(kegg7.id_kegiatan_reviewer))) AS total_reviewed_07,
    SUM(!(ISNULL(kegf9.id_kegiatan_reviewer) OR ISNULL(kegg9.id_kegiatan_reviewer))) AS total_reviewed_09
  FROM
    kegiatan AS keg
  LEFT JOIN kegiatan_reviewer AS kegr
      ON kegr.id_kegiatan = keg.id_kegiatan 
  LEFT JOIN kegiatan_feedback AS kegf4 ON kegf4.id_kegiatan_reviewer = kegr.id_kegiatan_reviewer AND kegf4.id_tahap = 4
  LEFT JOIN (SELECT * FROM kegiatan_grade AS kegg4 GROUP BY kegg4.id_kegiatan_reviewer) AS kegg4 ON kegg4.id_kegiatan_reviewer = kegr.id_kegiatan_reviewer AND kegg4.id_tahap = 4
  LEFT JOIN kegiatan_feedback AS kegf7 ON kegf7.id_kegiatan_reviewer = kegr.id_kegiatan_reviewer AND kegf7.id_tahap = 7
  LEFT JOIN (SELECT * FROM kegiatan_grade AS kegg7 GROUP BY kegg7.id_kegiatan_reviewer) AS kegg7 ON kegg7.id_kegiatan_reviewer = kegr.id_kegiatan_reviewer AND kegg7.id_tahap = 7
  LEFT JOIN kegiatan_feedback AS kegf9 ON kegf9.id_kegiatan_reviewer = kegr.id_kegiatan_reviewer AND kegf9.id_tahap = 9
  LEFT JOIN (SELECT * FROM kegiatan_grade AS kegg9 GROUP BY kegg9.id_kegiatan_reviewer) AS kegg9 ON kegg9.id_kegiatan_reviewer = kegr.id_kegiatan_reviewer AND kegg9.id_tahap = 9
  GROUP BY keg.id_kegiatan
`;

const ALL_KEGIATAN_QUERY = (where) => `
  SELECT
    keg.*, ske.id_program, ske.nama_skema, jto.nama_jenis_topik, jte.nama_jenis_tema, jfo.nama_jenis_fokus, sbk.nama_sbk, tkt.nama_tkt, kegrs.total_reviewer, kegrs.total_reviewed_04, kegrs.total_reviewed_07, kegrs.total_reviewed_09,
    CAST(CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id_user', kan.id_user, 'posisi', kan.posisi, 'username', user.username, 'nama_user', user.nama_user) ORDER BY kan.id_kegiatan_anggota ASC SEPARATOR ', '), ']') AS JSON) AS anggota
  FROM
    kegiatan keg
    LEFT JOIN skema AS ske
      ON ske.id_skema = keg.id_skema
    LEFT JOIN jenis_topik AS jto
      ON jto.id_jenis_topik = keg.id_jenis_topik
    LEFT JOIN jenis_tema AS jte
      ON jte.id_jenis_tema = jto.id_jenis_tema
    LEFT JOIN jenis_fokus AS jfo
      ON jfo.id_jenis_fokus = jte.id_jenis_fokus
    LEFT JOIN sbk
      ON sbk.id_sbk = keg.id_sbk
    LEFT JOIN tkt
      ON tkt.id_tkt = keg.id_tkt
    LEFT JOIN kegiatan_anggota AS kan
      ON kan.id_kegiatan = keg.id_kegiatan
    LEFT JOIN USER
      ON user.id_user = kan.id_user
    LEFT JOIN (${KEGIATAN_REVIEWER_STATUS}) as kegrs ON kegrs.id_kegiatan = keg.id_kegiatan
     ${where} 
    GROUP BY keg.id_kegiatan
`;

const __mapAddStatus = async (db, kegiatan) => {
  const periode = toAssocCompositeKey(await getAllPeriode(db), ["tahun", "id_program", "id_tahap"]);
  return kegiatan.map((k) => {
    const { status: status_t1 } = periode[k.tahun + k.id_program + "1"];
    if (status_t1 == "BELUM")
      return { ...k, light: "GREEN", message: "Menunggu periode submission" };

    if (!k.is_submitted) {
      return {
        ...k,
        light: status_t1 == "BERJALAN" ? "ORANGE" : "RED",
        message: status_t1 == "BERJALAN" ? "Usulan belum di submit" : "Usulan tidak di submit",
      };
    }

    const { status: status_t2 } = periode[k.tahun + k.id_program + "2"];
    if (status_t2 == "BELUM") return { ...k, light: "GREEN", message: "Usulan telah di submit" };

    if (k.approval != "DITERIMA") {
      return {
        ...k,
        light: status_t2 == "BERJALAN" && k.approval != "DITOLAK" ? "ORANGE" : "RED",
        message:
          status_t2 == "BERJALAN" && k.approval != "DITOLAK"
            ? "Usulan belum di approve"
            : "Usulan ditolak",
      };
    }

    const { status: status_t3 } = periode[k.tahun + k.id_program + "3"];
    if (status_t3 == "BELUM") return { ...k, light: "GREEN", message: "Usulan di approve" };

    if (k.total_reviewer == 0) {
      return {
        ...k,
        light: status_t3 == "BERJALAN" ? "ORANGE" : "RED",
        message: status_t3 == "BERJALAN" ? "Reviewer belum di assign" : "Reviewer tidak di assign",
      };
    }

    const { status: status_t4 } = periode[k.tahun + k.id_program + "4"];
    if (status_t4 == "BELUM") return { ...k, light: "GREEN", message: "Reviewer telah di assign" };
  });
};

const getKegiatanDosen = async (req, res) => {
  const { id_user } = req.session.user;
  const results = await req.db.asyncQuery(
    ALL_KEGIATAN_QUERY(
      "WHERE keg.id_kegiatan IN (SELECT id_kegiatan FROM kegiatan_anggota WHERE id_user = ?)"
    ),
    [id_user]
  );
  res.status(HTTPStatus.OK).send(await __mapAddStatus(req.db, results));
};

const get = async (req, res) => {
  const { id_kegiatan } = req.params;
  const results = await req.db.asyncQuery(ALL_KEGIATAN_QUERY("WHERE keg.id_kegiatan = ?"), [
    id_kegiatan,
  ]);
  if (results.length == 0) {
    res.status(HTTPStatus.NOT_FOUND).send({ error: "Kegiatan tidak ditemukan" });
    return;
  }
  res.status(HTTPStatus.OK).send((await __mapAddStatus(req.db, results))[0]);
};

const add = async (req, res) => {
  const { id_user } = req.session.user;

  const newKegiatan = { ...req.body, id_user };
  const { insertId } = await req.db.asyncQuery("INSERT INTO `kegiatan` SET ?", newKegiatan);

  const newAnggota = { id_kegiatan: insertId, id_user, posisi: "KETUA", status: "DITERIMA" };
  await req.db.asyncQuery("INSERT INTO `kegiatan_anggota` SET ?", newAnggota);

  const results = await req.db.asyncQuery(ALL_KEGIATAN_QUERY("WHERE keg.id_kegiatan = ?"), [
    insertId,
  ]);
  res.status(HTTPStatus.OK).send((await __mapAddStatus(req.db, results))[0]);
};

module.exports = {
  getKegiatanDosen,
  get,
  add,
};
