const util = require("util");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");


const mongoUri = "mongodb+srv://bahiges:NancyAjram@bahige.xxlki.mongodb.net/productsdb?retryWrites=true&w=majority";

var storage = new GridFsStorage({
  url: mongoUri,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg", "image/jpg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}_${file.originalname}`;
      return filename;
    }

    return {
      bucketName: "photos",
      filename: `${Date.now()}_${file.originalname}`
    };
  }
});

var uploadFile = multer({ storage: storage }).single("image");
var uploadFilesMiddleware = util.promisify(uploadFile);

module.exports = uploadFilesMiddleware;