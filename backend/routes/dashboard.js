const auth = require("../middleware/auth");

module.exports = (app, db) => {
  app.get("/api/dashboard", auth, async (req,res) => {
    const [shopRows]=await db.query("SELECT * FROM shops WHERE vendor_id=?",[req.vendor.id]);
    if(!shopRows.length) return res.json({shop:null,stats:{},weekly:[],monthly:[],bestSellers:[],lowStock:[]});
    const shop=shopRows[0];

    const [[sales]]=await db.query("SELECT COALESCE(SUM(total),0) AS value FROM orders WHERE shop_id=? AND status='DELIVERED' AND DATE(created_at)=CURDATE()",[shop.id]);
    const [[ordersToday]]=await db.query("SELECT COUNT(*) AS value FROM orders WHERE shop_id=? AND DATE(created_at)=CURDATE()",[shop.id]);
    const [[pending]]=await db.query("SELECT COUNT(*) AS value FROM orders WHERE shop_id=? AND status<>'DELIVERED'",[shop.id]);
    const [[products]]=await db.query("SELECT COUNT(*) AS value FROM products WHERE shop_id=?",[shop.id]);

    const [weekly]=await db.query(`
      SELECT DATE(created_at) day, COALESCE(SUM(total),0) sales
      FROM orders WHERE shop_id=? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at) ORDER BY day`,[shop.id]);

    const [monthly]=await db.query(`
      SELECT DATE_FORMAT(created_at,'%Y-%m') month, COALESCE(SUM(total),0) sales
      FROM orders WHERE shop_id=? AND status='DELIVERED' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
      GROUP BY DATE_FORMAT(created_at,'%Y-%m') ORDER BY month`,[shop.id]);

    const [bestSellers]=await db.query(`
      SELECT oi.product_name, SUM(oi.quantity) quantity
      FROM order_items oi JOIN orders o ON o.id=oi.order_id
      WHERE o.shop_id=? AND o.status='DELIVERED'
      GROUP BY oi.product_id,oi.product_name ORDER BY quantity DESC LIMIT 5`,[shop.id]);

    const [lowStock]=await db.query(
      "SELECT id,name,stock FROM products WHERE shop_id=? AND stock<=5 ORDER BY stock ASC",[shop.id]
    );

    res.json({
      shop,
      stats:{todaySales:Number(sales.value),ordersToday:Number(ordersToday.value),pendingOrders:Number(pending.value),products:Number(products.value)},
      weekly,monthly,bestSellers,lowStock
    });
  });
};
