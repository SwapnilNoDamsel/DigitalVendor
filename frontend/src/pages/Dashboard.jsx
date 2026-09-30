import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { PUBLIC_APP_URL } from "../api";
import { assetUrl, productEmoji } from "../utils/product";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { QRCodeCanvas } from "qrcode.react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const statusLabel = {
  NEW: "New",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready",
  DELIVERED: "Delivered"
};

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [qr, setQr] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = () =>
    api.get("/dashboard").then((r) => setD(r.data));

  useEffect(() => {
    load();

    api.get("/shop/me").then((r) => {
      if (r.data?.slug) {
        api
          .get(`/shop/${r.data.slug}/qr`)
          .then((x) => setQr(x.data))
          .catch(() => setQr(null));
      }
    });
  }, []);

  if (!d) {
    return (
      <main className="container py-5">
        <div className="text-center">Loading dashboard...</div>
      </main>
    );
  }

  if (!d.shop) {
    return (
      <main className="container py-5">
        <div className="card border-0 shadow-sm p-5 text-center">
          <h2>Create your shop first</h2>
          <p className="text-secondary">
            Once your shop is created, your sales and order dashboard
            will appear here.
          </p>
          <Link className="btn btn-primary" to="/shop-setup">
            Create My Shop
          </Link>
        </div>
      </main>
    );
  }

  const publicUrl = `${PUBLIC_APP_URL}/shop/${d.shop.slug}`;

  const chart = {
    labels: (d.weekly || []).map((x) => x.dayLabel),
    datasets: [
      {
        label: "Delivered sales",
        data: (d.weekly || []).map((x) => Number(x.sales)),
        borderRadius: 8,
        maxBarThickness: 42
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            ` ₹${Number(context.raw || 0).toLocaleString("en-IN")}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) =>
            `₹${Number(value).toLocaleString("en-IN")}`
        },
        grid: {
          color: "#eef1f5"
        }
      }
    }
  };

  const copyShopLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="container py-5">

      {/* HEADER */}
      <div className="dashboard-hero mb-4">
        <div>
          <span className="eyebrow">BUSINESS DASHBOARD</span>
          <h2 className="fw-bold mb-1">{d.shop.shop_name}</h2>
          <p className="text-secondary mb-0">
            {d.shop.address}
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <Link className="btn btn-outline-dark" to="/shop-setup">
            Edit Shop
          </Link>

          <Link className="btn btn-primary" to="/products">
            + Add Product
          </Link>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="row g-3">
        {[
          {
            label: "Today's Sales",
            value: `₹${Number(d.stats.todaySales || 0).toLocaleString("en-IN")}`,
            icon: "₹",
            tone: "sales"
          },
          {
            label: "Orders Today",
            value: d.stats.ordersToday || 0,
            icon: "🛒",
            tone: "orders"
          },
          {
            label: "Products",
            value: d.stats.products || 0,
            icon: "📦",
            tone: "products"
          },
          {
            label: "Pending Orders",
            value: d.stats.pendingOrders || 0,
            icon: "⏳",
            tone: "pending"
          }
        ].map((item) => (
          <div className="col-6 col-lg-3" key={item.label}>
            <div className={`stat-card stat-card-modern ${item.tone}`}>
              <div className="stat-icon">{item.icon}</div>
              <div>
                <small>{item.label}</small>
                <h3>{item.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SALES + QR */}
      <div className="row g-4 mt-1">

        <div className="col-lg-8">
          <div className="card dashboard-card border-0 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <span className="dashboard-label">PERFORMANCE</span>
                <h5 className="mb-1">Weekly Sales</h5>
                <p className="small text-secondary mb-0">
                  Delivered orders from the last 7 days
                </p>
              </div>

              <span className="dashboard-pill">
                {d.stats.deliveredOrders || 0} delivered
              </span>
            </div>

            <div className="dashboard-chart">
              <Bar data={chart} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card dashboard-card border-0 shadow-sm p-4 text-center h-100">
            <span className="dashboard-label">SHARE YOUR SHOP</span>
            <h5 className="mb-1">Your Shop QR</h5>
            <p className="small text-secondary">
              Customers can scan this QR to open your storefront.
            </p>

            {qr ? (
              <>
                <div className="dashboard-qr-wrap my-2">
                  <QRCodeCanvas value={publicUrl} size={170} />
                </div>

                <div className="small text-break text-secondary">
                  {publicUrl}
                </div>

                <button
                  className="btn btn-outline-dark btn-sm mt-3"
                  onClick={copyShopLink}
                >
                  {copied ? "✓ Link Copied" : "Copy Shop Link"}
                </button>

                <a
                  className="btn btn-success btn-sm mt-2"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://wa.me/?text=${encodeURIComponent(
                    "Visit my shop online: " + publicUrl
                  )}`}
                >
                  Share on WhatsApp
                </a>
              </>
            ) : (
              <p className="text-secondary mb-0">Loading QR...</p>
            )}
          </div>
        </div>
      </div>

      {/* TODAY'S SUMMARY */}
      <div className="card dashboard-summary border-0 shadow-sm mt-4">
        <div className="p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <span className="dashboard-label">TODAY'S SUMMARY</span>
              <h5 className="mb-0">A quick view of your shop</h5>
            </div>

            <Link to="/orders" className="btn btn-sm btn-outline-primary">
              View all orders →
            </Link>
          </div>

          <div className="row g-3 mt-2">
            <div className="col-6 col-md-3">
              <div className="summary-item">
                <span>Sales</span>
                <strong>
                  ₹{Number(d.stats.todaySales || 0).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="summary-item">
                <span>Orders</span>
                <strong>{d.stats.ordersToday || 0}</strong>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="summary-item">
                <span>Pending</span>
                <strong>{d.stats.pendingOrders || 0}</strong>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="summary-item">
                <span>Low stock</span>
                <strong>{d.lowStock?.length || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="row g-4 mt-1">
        <div className="col-lg-7">
          <div className="card dashboard-card border-0 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span className="dashboard-label">LATEST ACTIVITY</span>
                <h5 className="mb-0">Recent Orders</h5>
              </div>

              <Link to="/orders" className="small fw-semibold">
                Manage →
              </Link>
            </div>

            {d.recentOrders?.length ? (
              <div className="recent-order-list">
                {d.recentOrders.map((o) => (
                  <div className="recent-order" key={o.id}>
                    <div className="recent-order-main">
                      <div className="recent-order-icon">🛍️</div>
                      <div>
                        <strong>
                          Order #{o.vendor_order_number}
                        </strong>
                        <div className="small text-secondary">
                          {o.customer_name} · {o.payment_method}
                        </div>
                      </div>
                    </div>

                    <div className="text-end">
                      <strong>
                        ₹{Number(o.total).toFixed(2)}
                      </strong>
                      <div className="small dashboard-status">
                        {statusLabel[o.status] || o.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty compact-empty">
                Your recent customer orders will appear here.
              </div>
            )}
          </div>
        </div>

        {/* BEST SELLERS */}
        <div className="col-lg-5">
          <div className="card dashboard-card border-0 shadow-sm p-4 h-100">
            <span className="dashboard-label">PRODUCT PERFORMANCE</span>
            <h5 className="mb-3">Best-selling Products</h5>

            {d.bestSellers?.length ? (
              <div>
                {d.bestSellers.map((x) => (
                  <div className="dashboard-product-row" key={x.product_id || x.product_name}>
                    {x.image_url ? (
                      <img
                        src={assetUrl(x.image_url)}
                        alt=""
                        className="dashboard-product-thumb"
                      />
                    ) : (
                      <div className="dashboard-product-thumb product-fallback-mini">
                        {productEmoji(x)}
                      </div>
                    )}

                    <div className="flex-grow-1">
                      <strong>{x.product_name}</strong>
                      <div className="small text-secondary">
                        {x.quantity} sold
                      </div>
                    </div>

                    <span className="rank-dot">
                      #{d.bestSellers.indexOf(x) + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty compact-empty">
                Complete a few delivered orders to see your best sellers.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOW STOCK */}
      <div className="card dashboard-card border-0 shadow-sm p-4 mt-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <span className="dashboard-label">INVENTORY ALERT</span>
            <h5 className="mb-0">Low Stock</h5>
          </div>

          <Link to="/products" className="btn btn-sm btn-outline-danger">
            Restock Products
          </Link>
        </div>

        {d.lowStock?.length ? (
          <div className="row g-3">
            {d.lowStock.map((x) => (
              <div className="col-md-6 col-lg-4" key={x.id}>
                <div className="low-stock-card">
                  <div className="low-stock-icon">
                    {productEmoji(x)}
                  </div>
                  <div className="flex-grow-1">
                    <strong>{x.name}</strong>
                    <div className="small text-danger fw-semibold">
                      Only {x.stock} left
                    </div>
                  </div>
                  <span className="low-stock-badge">LOW STOCK</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="success-stock">
            <span>✓</span>
            All products have healthy stock levels.
          </div>
        )}
      </div>

    </main>
  );
}
