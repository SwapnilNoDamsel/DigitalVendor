const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (_, file, cb) => {
  const ok = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg"
  ].includes(file.mimetype);

  cb(
    ok
      ? null
      : new Error("Only JPG, PNG and WEBP images are allowed"),
    ok
  );
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 4 * 1024 * 1024
  }
});