const auth = require("../middleware/auth");

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

module.exports = (app, db) => {
  app.get("/api/dashboard", auth, async (req, res) => {
    try {
      const [shopRows] = await db.query(
        "SELECT * FROM shops WHERE vendor_id=?",
        [req.vendor.id]
      );

      if (!shopRows.length) {
        return res.json({
          shop: null,
          stats: {},
          weekly: [],
          monthly: [],
          bestSellers: [],
          lowStock: [],
          recentOrders: []
        });
      }

      const shop = shopRows[0];

      const [[sales]] = await db.query(
        `SELECT COALESCE(SUM(total),0) AS value
         FROM orders
         WHERE shop_id=?
           AND status='DELIVERED'
           AND DATE(created_at)=CURDATE()`,
        [shop.id]
      );

      const [[ordersToday]] = await db.query(
        `SELECT COUNT(*) AS value
         FROM orders
         WHERE shop_id=?
           AND DATE(created_at)=CURDATE()`,
        [shop.id]
      );

      const [[pending]] = await db.query(
        `SELECT COUNT(*) AS value
         FROM orders
         WHERE shop_id=?
           AND status <> 'DELIVERED'`,
        [shop.id]
      );

      const [[products]] = await db.query(
        `SELECT COUNT(*) AS value
         FROM products
         WHERE shop_id=?`,
        [shop.id]
      );

      const [[deliveredOrders]] = await db.query(
        `SELECT COUNT(*) AS value
         FROM orders
         WHERE shop_id=? AND status='DELIVERED'`,
        [shop.id]
      );

      const [weeklyRows] = await db.query(
        `SELECT DATE(created_at) AS day,
                COALESCE(SUM(total),0) AS sales
         FROM orders
         WHERE shop_id=?
           AND status='DELIVERED'
           AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
         GROUP BY DATE(created_at)
         ORDER BY day`,
        [shop.id]
      );

      // Always return exactly seven days so the chart never has gaps
      // or raw ISO date strings.
      const salesByDate = Object.fromEntries(
        weeklyRows.map((row) => [
          typeof row.day === "string"
            ? row.day.slice(0, 10)
            : dateKey(new Date(row.day)),
          Number(row.sales)
        ])
      );

      const weekly = Array.from({ length: 7 }, (_, index) => {
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - (6 - index));

        const key = dateKey(day);

        return {
          date: key,
          dayLabel: day.toLocaleDateString("en-IN", {
            weekday: "short"
          }),
          sales: salesByDate[key] || 0
        };
      });

      const [monthly] = await db.query(
        `SELECT DATE_FORMAT(created_at,'%Y-%m') AS month,
                COALESCE(SUM(total),0) AS sales
         FROM orders
         WHERE shop_id=?
           AND status='DELIVERED'
           AND created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
         GROUP BY DATE_FORMAT(created_at,'%Y-%m')
         ORDER BY month`,
        [shop.id]
      );

      const [bestSellers] = await db.query(
        `SELECT
           oi.product_id,
           oi.product_name,
           p.image_url,
           SUM(oi.quantity) AS quantity
         FROM order_items oi
         JOIN orders o ON o.id=oi.order_id
         LEFT JOIN products p ON p.id=oi.product_id
         WHERE o.shop_id=?
           AND o.status='DELIVERED'
         GROUP BY oi.product_id, oi.product_name, p.image_url
         ORDER BY quantity DESC
         LIMIT 5`,
        [shop.id]
      );

      const [lowStock] = await db.query(
        `SELECT id,name,image_url,stock
         FROM products
         WHERE shop_id=? AND stock<=5
         ORDER BY stock ASC, name ASC`,
        [shop.id]
      );

      const [recentOrders] = await db.query(
        `SELECT
           o.id,
           o.customer_name,
           o.customer_mobile,
           o.total,
           o.payment_method,
           o.payment_status,
           o.status,
           o.created_at,
           ROW_NUMBER() OVER (ORDER BY o.id ASC) AS vendor_order_number
         FROM orders o
         WHERE o.shop_id=?
         ORDER BY o.created_at DESC, o.id DESC
         LIMIT 5`,
        [shop.id]
      );

      res.json({
        shop,
        stats: {
          todaySales: Number(sales.value),
          ordersToday: Number(ordersToday.value),
          pendingOrders: Number(pending.value),
          products: Number(products.value),
          deliveredOrders: Number(deliveredOrders.value)
        },
        weekly,
        monthly,
        bestSellers,
        lowStock,
        recentOrders
      });
    } catch (e) {
      console.error("DASHBOARD ERROR:", e);

      res.status(500).json({
        message: "Could not load dashboard",
        error: e.message
      });
    }
  });
};
