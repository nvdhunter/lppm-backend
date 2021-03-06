const path = require("path");
const readChunk = require("read-chunk");
const FileType = require("file-type");
const fs = require("fs");
const HTTPStatus = require("http-status");

const serveFile = async (id, res, folder) => {
  if (!/^[0-9A-F]{32}$/i.test(id)) {
    res.status(HTTPStatus.BAD_REQUEST).send({ error: "Sepesifikasi request tidak bisa dipenuhi" });
    return false;
  }
  const filePath = path.join(folder, id);
  if (!fs.existsSync(filePath)) {
    res.status(HTTPStatus.NOT_FOUND).send({ error: "File tidak ditemukan" });
    return false;
  }
  const buffer = readChunk.sync(filePath, 0, 4100);
  const storedMimeType = await FileType.fromBuffer(buffer);
  res.setHeader("Content-Type", storedMimeType.mime);
  fs.createReadStream(filePath).pipe(res);
};

const toAssocCompositeKey = (arr = [], keys = [], separator = "") => {
  const newArr = {};
  arr.forEach((e) => {
    var compositeKey = [];
    keys.forEach((key) => {
      compositeKey.push(e[key]);
    });
    newArr[compositeKey.join(separator)] = e;
  });
  return newArr;
};

const deleteFile = (url, folder) => {
  const url_segments = url.split("/");
  const id = url_segments[url_segments.length - 1];
  try {
    fs.unlinkSync(folder + id);
  } catch (err) {}
};

const HOSTNAME = "http://" + process.env.LOCAL_IP + ":8888/";

module.exports = { serveFile, toAssocCompositeKey, deleteFile, HOSTNAME };
