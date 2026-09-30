const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadBufferToCloudinary } = require("../utils/cloudinary");

async function getShop(db, vendorId) {
  const [rows] = await db.query(
    "SELECT * FROM shops WHERE vendor_id=?",
    [vendorId]
  );
  return rows[0];
}

module.exports = (app, db) => {
  app.get("/api/products", auth, async (req, res) => {
    try {
      const shop = await getShop(db, req.vendor.id);
      if (!shop) {
        return res.status(404).json({
          message: "Create your shop first"
        });
      }

      const [rows] = await db.query(
        "SELECT * FROM products WHERE shop_id=? ORDER BY created_at DESC",
        [shop.id]
      );

      res.json(rows);
    } catch (e) {
      res.status(500).json({
        message: "Could not load products",
        error: e.message
      });
    }
  });

  app.post(
    "/api/products",
    auth,
    upload.single("image"),
    async (req, res) => {
      try {
        const shop = await getShop(db, req.vendor.id);

        if (!shop) {
          return res.status(400).json({
            message: "Create your shop first"
          });
        }

        const b = req.body;

        if (!b.name || b.price === undefined) {
          return res.status(400).json({
            message: "Product name and price are required"
          });
        }

        let imageUrl = null;

        if (req.file) {
          const uploaded = await uploadBufferToCloudinary(
            req.file,
            "digitalvendor/products"
          );
          imageUrl = uploaded.secure_url;
        }

        const stock = Math.max(0, Number(b.stock || 0));

        const [result] = await db.query(
          `INSERT INTO products
          (shop_id,name,image_url,price,category,description,stock,is_available)
          VALUES(?,?,?,?,?,?,?,?)`,
          [
            shop.id,
            b.name.trim(),
            imageUrl,
            Number(b.price),
            b.category?.trim() || "General",
            b.description?.trim() || "",
            stock,
            stock > 0
          ]
        );

        const [rows] = await db.query(
          "SELECT * FROM products WHERE id=?",
          [result.insertId]
        );

        res.status(201).json(rows[0]);
      } catch (e) {
        console.error("ADD PRODUCT ERROR:", e);

        res.status(500).json({
          message: "Could not add product",
          error: e.message
        });
      }
    }
  );

  app.put(
    "/api/products/:id",
    auth,
    upload.single("image"),
    async (req, res) => {
      try {
        const shop = await getShop(db, req.vendor.id);

        if (!shop) {
          return res.status(404).json({
            message: "Create your shop first"
          });
        }

        const [oldRows] = await db.query(
          "SELECT * FROM products WHERE id=? AND shop_id=?",
          [req.params.id, shop.id]
        );

        if (!oldRows.length) {
          return res.status(404).json({
            message: "Product not found"
          });
        }

        const old = oldRows[0];
        const b = req.body;

        let imageUrl = old.image_url;

        if (req.file) {
          const uploaded = await uploadBufferToCloudinary(
            req.file,
            "digitalvendor/products"
          );
          imageUrl = uploaded.secure_url;
        }

        const stock = Math.max(
          0,
          Number(b.stock ?? old.stock)
        );

        const isAvailable =
          b.isAvailable === undefined
            ? stock > 0
            : String(b.isAvailable) === "true" ||
              Number(b.isAvailable) === 1;

        await db.query(
          `UPDATE products SET
            name=?,
            image_url=?,
            price=?,
            category=?,
            description=?,
            stock=?,
            is_available=?
           WHERE id=?`,
          [
            b.name?.trim() || old.name,
            imageUrl,
            Number(b.price ?? old.price),
            b.category?.trim() || "General",
            b.description?.trim() || "",
            stock,
            isAvailable,
            req.params.id
          ]
        );

        const [rows] = await db.query(
          "SELECT * FROM products WHERE id=?",
          [req.params.id]
        );

        res.json(rows[0]);
      } catch (e) {
        console.error("UPDATE PRODUCT ERROR:", e);

        res.status(500).json({
          message: "Could not update product",
          error: e.message
        });
      }
    }
  );

  app.delete("/api/products/:id", auth, async (req, res) => {
    try {
      const shop = await getShop(db, req.vendor.id);

      const [r] = await db.query(
        "DELETE FROM products WHERE id=? AND shop_id=?",
        [req.params.id, shop?.id]
      );

      if (!r.affectedRows) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      res.json({
        message: "Product deleted"
      });
    } catch (e) {
      res.status(500).json({
        message: "Could not delete product",
        error: e.message
      });
    }
  });
};
