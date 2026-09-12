const multer = require("multer");
const path = require("path");
const fs = require("fs");

const dir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, dir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, "-");
    cb(null, `${Date.now()}-${safe}${ext}`);
  }
});

const fileFilter = (_, file, cb) => {
  const ok = ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.mimetype);
  cb(ok ? null : new Error("Only JPG, PNG and WEBP images are allowed"), ok);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 4 * 1024 * 1024 } });
