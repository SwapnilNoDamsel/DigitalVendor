const auth = require("../middleware/auth");

const validStatuses = ["NEW", "ACCEPTED", "PREPARING", "READY", "DELIVERED"];

async function getShop(db, vendorId) {
  const [rows] = await db.query("SELECT * FROM shops WHERE vendor_id=?", [vendorId]);
  return rows[0];
}

module.exports = (app, db) => {
  app.post("/api/orders", async (req, res) => {
    const conn = await db.getConnection();
    try {
      const { shopId, customerName, customerMobile,deliveryAddress, paymentMethod, items } = req.body;
      if (!shopId || !customerName || !customerMobile || !deliveryAddress || !Array.isArray(items) || !items.length)
        return res.status(400).json({ message: "Complete customer and cart details are required" });
      await conn.beginTransaction();

      const [shopRows] = await conn.query("SELECT * FROM shops WHERE id=?", [shopId]);
      if (!shopRows.length) throw new Error("Shop not found");

      let total = 0, prepared = [];
      for (const item of items) {
        const [rows] = await conn.query("SELECT * FROM products WHERE id=? AND shop_id=? FOR UPDATE", [item.productId, shopId]);
        if (!rows.length) throw new Error("One of the products is no longer available");
        const p = rows[0], qty = Number(item.quantity);
        if (qty < 1 || p.stock < qty || !p.is_available) throw new Error(`${p.name} has insufficient stock`);
        const subtotal = Number(p.price) * qty;
        total += subtotal;
        prepared.push({ p, qty, subtotal });
      }

      const pm = paymentMethod === "UPI" ? "UPI" : "COD";
      const ps = pm === "COD" ? "CASH" : "PENDING";
      const [order] = await conn.query(
        "INSERT INTO orders(shop_id,customer_name,customer_mobile,delivery_address,payment_method,payment_status,status,total) VALUES(?,?,?,?,?,?,?,?)",
        [shopId, customerName, customerMobile, deliveryAddress, pm, ps, "NEW", total]
      );

      for (const x of prepared) {
        await conn.query(
          "INSERT INTO order_items(order_id,product_id,product_name,price,quantity,subtotal) VALUES(?,?,?,?,?,?)",
          [order.insertId, x.p.id, x.p.name, x.p.price, x.qty, x.subtotal]
        );
        await conn.query("UPDATE products SET stock=stock-?, is_available=IF(stock-?>0,is_available,is_available) WHERE id=?", [x.qty, x.qty, x.p.id]);
        await conn.query("UPDATE products SET is_available=IF(stock<=0,FALSE,is_available) WHERE id=?", [x.p.id]);
      }
      await conn.commit();
      res.status(201).json({ orderId: order.insertId, total });
    } catch (e) {
      await conn.rollback();
      res.status(400).json({ message: e.message || "Could not place order" });
    } finally { conn.release(); }
  });

  app.get("/api/orders/vendor", auth, async (req, res) => {
    const shop = await getShop(db, req.vendor.id);
    if (!shop) return res.json([]);
    const [orders] = await db.query("SELECT * FROM orders WHERE shop_id=? ORDER BY created_at DESC", [shop.id]);
    for (const o of orders) {
      const [items] = await db.query("SELECT * FROM order_items WHERE order_id=?", [o.id]);
      o.items = items;
    }
    res.json(orders);
  });

  app.patch("/api/orders/:id/status", auth, async (req, res) => {
    const shop = await getShop(db, req.vendor.id);
    const { status } = req.body;
    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid order status" });
    const [r] = await db.query("UPDATE orders SET status=? WHERE id=? AND shop_id=?", [status, req.params.id, shop?.id]);
    if (!r.affectedRows) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order status updated" });
  });

  app.patch("/api/orders/:id/payment", auth, async (req, res) => {
    const shop = await getShop(db, req.vendor.id);
    const { paymentStatus } = req.body;
    if (!["PENDING", "PAID", "CASH"].includes(paymentStatus)) return res.status(400).json({ message: "Invalid payment status" });
    const [r] = await db.query("UPDATE orders SET payment_status=? WHERE id=? AND shop_id=?", [paymentStatus, req.params.id, shop?.id]);
    if (!r.affectedRows) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Payment status updated" });
  });

  app.get("/api/orders/track/:id", async (req, res) => {
    const [rows] = await db.query(
      "SELECT o.*,s.shop_name FROM orders o JOIN shops s ON s.id=o.shop_id WHERE o.id=?", [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Order not found" });
    const [items] = await db.query("SELECT * FROM order_items WHERE order_id=?", [req.params.id]);
    res.json({ ...rows[0], items });
  });
};
