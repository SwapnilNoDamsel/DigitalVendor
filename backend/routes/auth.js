const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (app, db) => {
  app.post("/api/vendors/register", async (req, res) => {
    try {
      const { name, mobile, email, password } = req.body;
      if (!name || !mobile || !password) return res.status(400).json({ message: "Name, mobile and password are required" });
      if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

      const [exists] = await db.query("SELECT id FROM vendors WHERE mobile = ? OR (email IS NOT NULL AND email = ?)", [mobile, email || null]);
      if (exists.length) return res.status(409).json({ message: "A vendor with this mobile/email already exists" });

      const hash = await bcrypt.hash(password, 10);
      const [result] = await db.query(
        "INSERT INTO vendors (name,mobile,email,password_hash) VALUES (?,?,?,?)",
        [name.trim(), mobile.trim(), email?.trim() || null, hash]
      );
      const token = jwt.sign({ id: result.insertId, name }, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({ token, vendor: { id: result.insertId, name, mobile, email: email || "" } });
    } catch (e) {
      res.status(500).json({ message: "Registration failed", error: e.message });
    }
  });

  app.post("/api/vendors/login", async (req, res) => {
    try {
      const { mobile, password } = req.body;
      const [rows] = await db.query("SELECT * FROM vendors WHERE mobile = ?", [mobile]);
      if (!rows.length) return res.status(401).json({ message: "Invalid mobile or password" });
      const vendor = rows[0];
      const ok = await bcrypt.compare(password, vendor.password_hash);
      if (!ok) return res.status(401).json({ message: "Invalid mobile or password" });
      const token = jwt.sign({ id: vendor.id, name: vendor.name }, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, vendor: { id: vendor.id, name: vendor.name, mobile: vendor.mobile, email: vendor.email || "" } });
    } catch (e) {
      res.status(500).json({ message: "Login failed", error: e.message });
    }
  });
};
