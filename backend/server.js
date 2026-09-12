require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 5000;

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadDir));

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "digitalvendor",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, message: "DigitalVendor API is running" });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Database connection failed", error: e.message });
  }
});

require("./routes/auth")(app, pool);
require("./routes/shop")(app, pool);
require("./routes/products")(app, pool);
require("./routes/orders")(app, pool);
require("./routes/dashboard")(app, pool);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

app.listen(PORT, () => console.log(`DigitalVendor backend running on http://localhost:${PORT}`));
