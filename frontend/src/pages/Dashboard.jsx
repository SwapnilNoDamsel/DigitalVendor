import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { QRCodeCanvas } from "qrcode.react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [qr, setQr] = useState(null);

  const load = () =>
    api.get("/dashboard").then((r) => setD(r.data));

  useEffect(() => {
    load();

    api.get("/shop/me").then((r) => {
      if (r.data?.slug) {
        api
          .get(`/shop/${r.data.slug}/qr`)
          .then((x) => setQr(x.data));
      }
    });
  }, []);

  if (!d) {
    return (
      <main className="container py-5">
        <div className="text-center">
          Loading dashboard...
        </div>
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

          <Link
            className="btn btn-primary"
            to="/shop-setup"
          >
            Create My Shop
          </Link>
        </div>
      </main>
    );
  }

  const chart = {
    labels: d.weekly.map(
      (x) => x.day?.slice(5) || ""
    ),

    datasets: [
      {
        label: "Sales (₹)",
        data: d.weekly.map((x) =>
          Number(x.sales)
        ),
        tension: 0.35
      }
    ]
  };

  // Always use the deployed DigitalVendor URL
  // instead of localhost.
  const publicUrl =
    `https://digital-vendor-dpsc.vercel.app/shop/${d.shop.slug}`;

  return (
    <main className="container py-5">

      {/* HEADER */}
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">

        <div>
          <span className="eyebrow">
            BUSINESS DASHBOARD
          </span>

          <h2 className="fw-bold">
            {d.shop.shop_name}
          </h2>

          <p className="text-secondary mb-0">
            {d.shop.address}
          </p>
        </div>

        <div className="d-flex gap-2">

          <Link
            className="btn btn-outline-dark"
            to="/shop-setup"
          >
            Edit Shop
          </Link>

          <Link
            className="btn btn-primary"
            to="/products"
          >
            Add Product
          </Link>

        </div>
      </div>


      {/* STAT CARDS */}
      <div className="row g-3">

        {[
          [
            "Today's Sales",
            `₹${d.stats.todaySales.toFixed(2)}`
          ],
          [
            "Orders Today",
            d.stats.ordersToday
          ],
          [
            "Products",
            d.stats.products
          ],
          [
            "Pending Orders",
            d.stats.pendingOrders
          ]
        ].map((x) => (
          <div
            className="col-6 col-lg-3"
            key={x[0]}
          >
            <div className="stat-card">

              <small>
                {x[0]}
              </small>

              <h3>
                {x[1]}
              </h3>

            </div>
          </div>
        ))}

      </div>


      {/* SALES + QR */}
      <div className="row g-4 mt-1">

        {/* WEEKLY SALES */}
        <div className="col-lg-8">

          <div className="card border-0 shadow-sm p-4">

            <h5>
              Weekly Sales
            </h5>

            <div style={{ height: 280 }}>

              <Line
                data={chart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />

            </div>

          </div>

        </div>


        {/* QR CODE */}
        <div className="col-lg-4">

          <div className="card border-0 shadow-sm p-4 text-center h-100">

            <h5>
              Your QR Code
            </h5>

            {qr ? (
              <>

                {/* IMPORTANT:
                    QR now uses the production URL,
                    not qr.url / localhost.
                */}
                <QRCodeCanvas
                  value={publicUrl}
                  size={170}
                  className="my-3"
                />

                {/* Production shop URL */}
                <div className="small text-break">
                  {publicUrl}
                </div>

                {/* Copy shop link */}
                <button
                  className="btn btn-outline-dark btn-sm mt-3"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      publicUrl
                    )
                  }
                >
                  Copy Shop Link
                </button>

              </>
            ) : (

              <p className="text-secondary">
                Loading QR...
              </p>

            )}

            {/* WhatsApp Share */}
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

          </div>

        </div>

      </div>


      {/* BEST SELLERS + LOW STOCK */}
      <div className="row g-4 mt-1">

        {/* BEST SELLING PRODUCTS */}
        <div className="col-lg-6">

          <div className="card border-0 shadow-sm p-4">

            <h5>
              Best-selling Products
            </h5>

            {d.bestSellers.length ? (

              d.bestSellers.map((x) => (

                <div
                  className="d-flex justify-content-between py-2 border-bottom"
                  key={x.product_name}
                >

                  <span>
                    {x.product_name}
                  </span>

                  <b>
                    {x.quantity} sold
                  </b>

                </div>

              ))

            ) : (

              <p className="text-secondary">
                Complete orders to see best sellers.
              </p>

            )}

          </div>

        </div>


        {/* LOW STOCK */}
        <div className="col-lg-6">

          <div className="card border-0 shadow-sm p-4">

            <h5>
              ⚠ Low Stock
            </h5>

            {d.lowStock.length ? (

              d.lowStock.map((x) => (

                <div
                  className="d-flex justify-content-between py-2 border-bottom"
                  key={x.id}
                >

                  <span>
                    {x.name}
                  </span>

                  <b>
                    {x.stock} left
                  </b>

                </div>

              ))

            ) : (

              <p className="text-success">
                No low-stock products.
              </p>

            )}

          </div>

        </div>

      </div>

    </main>
  );
}