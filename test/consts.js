const DATABASE_OPTIONS = {
  host: process.env.LOCAL_IP,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
};

const ADMIN_CRED = {
  username: "admin",
  password: "wasdwasd",
  nama_role: "Admin",
};

const DOSEN1_CRED = {
  username: "dosen1",
  password: "wasdwasd",
  nama_role: "Dosen",
};

const DOSEN2_CRED = {
  username: "dosen2",
  password: "wasdwasd",
  nama_role: "Dosen",
};

const DOSEN3_CRED = {
  username: "dosen3",
  password: "wasdwasd",
  nama_role: "Dosen",
};

const DOSEN4_CRED = {
  username: "dosen4",
  password: "wasdwasd",
  nama_role: "Dosen",
};

const PIMPINAN1_CRED = {
  username: "pimpinan1",
  password: "wasdwasd",
  nama_role: "Pimpinan Fakultas",
};

const UNKNOWN_CRED = {
  username: "unkwon_credential",
  password: "wasdwasd",
  role: null,
};

const WRONG_CRED = {
  username: "admin",
  password: "wrong_password",
  nama_role: "Admin",
};

const ROLE_LENGTH = 4;
const PROGRAM_LENGTH = 6;
const FAKULTAS_LENGTH = 14;
const PROGRAM_STUDI_LENGTH = 118;
const SBK_LENGTH = 3;
const TKT_LENGTH = 9;
const JENIS_FOKUS_LENGTH = 9;
const JENIS_TEMA_LENGTH = 39;
const JENIS_TOPIK_LENGTH = 115;
const JENIS_BELANJA_LENGTH = 3;
const JENIS_LUARAN_LENGTH = 6;
const SUB_JENIS_LUARAN_LENGTH = 26;
const INDEXING_INSTITUTION_LENGTH = 4;
const SKEMA01_LENGTH = 7;

module.exports = {
  DATABASE_OPTIONS,
  ADMIN_CRED,
  DOSEN1_CRED,
  DOSEN2_CRED,
  DOSEN3_CRED,
  DOSEN4_CRED,
  PIMPINAN1_CRED,
  UNKNOWN_CRED,
  WRONG_CRED,
  ROLE_LENGTH,
  PROGRAM_LENGTH,
  FAKULTAS_LENGTH,
  PROGRAM_STUDI_LENGTH,
  SBK_LENGTH,
  TKT_LENGTH,
  JENIS_FOKUS_LENGTH,
  JENIS_TEMA_LENGTH,
  JENIS_TOPIK_LENGTH,
  JENIS_BELANJA_LENGTH,
  JENIS_LUARAN_LENGTH,
  SUB_JENIS_LUARAN_LENGTH,
  INDEXING_INSTITUTION_LENGTH,
  SKEMA01_LENGTH,
};
