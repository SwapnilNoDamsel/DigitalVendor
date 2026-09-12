const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const QRCode = require("qrcode");

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

module.exports = (app, db) => {
  app.get("/api/shop/me", auth, async (req, res) => {
    const [rows] = await db.query("SELECT * FROM shops WHERE vendor_id = ?", [req.vendor.id]);
    res.json(rows[0] || null);
  });

  app.post("/api/shop", auth, upload.fields([{ name: "logo", maxCount: 1 }, { name: "upiQr", maxCount: 1 }]), async (req, res) => {
    try {
      const b = req.body;
      if (!b.shopName || !b.category || !b.ownerName || !b.mobile || !b.address) {
        return res.status(400).json({ message: "Please fill all required shop details" });
      }

      const [existing] = await db.query("SELECT id FROM shops WHERE vendor_id = ?", [req.vendor.id]);
      if (existing.length) return res.status(409).json({ message: "You already have a shop. Edit your existing shop instead." });

      let slug = slugify(b.shopName) || `shop-${req.vendor.id}`;
      const [slugRows] = await db.query("SELECT id FROM shops WHERE slug = ?", [slug]);
      if (slugRows.length) slug = `${slug}-${req.vendor.id}`;

      const logo = req.files?.logo?.[0] ? `/uploads/${req.files.logo[0].filename}` : null;
      const upiQr = req.files?.upiQr?.[0] ? `/uploads/${req.files.upiQr[0].filename}` : null;

      const [result] = await db.query(
        `INSERT INTO shops
        (vendor_id,shop_name,slug,category,owner_name,mobile,address,opening_time,closing_time,logo_url,upi_id,upi_qr_url)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [req.vendor.id,b.shopName.trim(),slug,b.category,b.ownerName,b.mobile,b.address,b.openingTime || null,b.closingTime || null,logo,b.upiId || null,upiQr]
      );

      const shopUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/shop/${slug}`;
      const qrDataUrl = await QRCode.toDataURL(shopUrl);
      res.status(201).json({ id: result.insertId, slug, shopUrl, qrDataUrl });
    } catch (e) {
      res.status(500).json({ message: "Could not create shop", error: e.message });
    }
  });

  app.put("/api/shop", auth, upload.fields([{ name: "logo", maxCount: 1 }, { name: "upiQr", maxCount: 1 }]), async (req, res) => {
    try {
      const b = req.body;
      const [rows] = await db.query("SELECT * FROM shops WHERE vendor_id = ?", [req.vendor.id]);
      if (!rows.length) return res.status(404).json({ message: "Shop not found" });

      const old = rows[0];
      const logo = req.files?.logo?.[0] ? `/uploads/${req.files.logo[0].filename}` : old.logo_url;
      const upiQr = req.files?.upiQr?.[0] ? `/uploads/${req.files.upiQr[0].filename}` : old.upi_qr_url;

      await db.query(
        `UPDATE shops SET shop_name=?,category=?,owner_name=?,mobile=?,address=?,opening_time=?,closing_time=?,logo_url=?,upi_id=?,upi_qr_url=? WHERE vendor_id=?`,
        [b.shopName,b.category,b.ownerName,b.mobile,b.address,b.openingTime || null,b.closingTime || null,logo,b.upiId || null,upiQr,req.vendor.id]
      );
      res.json({ message: "Shop updated successfully" });
    } catch (e) {
      res.status(500).json({ message: "Could not update shop", error: e.message });
    }
  });

  app.get("/api/shop/public/:slug", async (req, res) => {
    const [shops] = await db.query("SELECT id,shop_name,slug,category,owner_name,mobile,address,opening_time,closing_time,logo_url,upi_id,upi_qr_url FROM shops WHERE slug = ?", [req.params.slug]);
    if (!shops.length) return res.status(404).json({ message: "Shop not found" });
    const shop = shops[0];
    const [products] = await db.query("SELECT * FROM products WHERE shop_id=? ORDER BY created_at DESC", [shop.id]);
    res.json({ shop, products });
  });

  app.get("/api/shop/:slug/qr", async (req, res) => {
    const [rows] = await db.query("SELECT slug FROM shops WHERE slug=?", [req.params.slug]);
    if (!rows.length) return res.status(404).json({ message: "Shop not found" });
    const url = `${process.env.FRONTEND_URL || "http://localhost:5173"}/shop/${rows[0].slug}`;
    const data = await QRCode.toDataURL(url);
    res.json({ url, data });
  });
};
