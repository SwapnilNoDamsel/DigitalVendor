import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="hero py-5">
        <div className="container py-4">
          <div className="row align-items-center g-5">

            <div className="col-lg-7">
              <span className="eyebrow">
                LOCAL BUSINESS • DIGITAL SIMPLE
              </span>

              <h1 className="display-3 fw-bold mt-3">
                Bring your local shop{" "}
                <span className="text-primary">online.</span>
              </h1>

              <p className="lead text-secondary mt-3">
                DigitalVendor helps small vendors create an online
                storefront, share it with a QR code, receive orders
                and understand their sales — without making customers
                register.
              </p>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <Link
                  className="btn btn-primary btn-lg"
                  to="/register"
                >
                  Create My Shop
                </Link>

                <a
                  className="btn btn-outline-dark btn-lg"
                  href="#features"
                >
                  Explore Features
                </a>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="mock-dashboard shadow-sm">

                <div className="d-flex justify-content-between">
                  <b>Vendor Dashboard</b>

                  <span className="badge bg-success-subtle text-success">
                    Live
                  </span>
                </div>

                <div className="metric-grid mt-4">

                  <div>
                    <small>Today's Sales</small>
                    <h3>₹2,450</h3>
                  </div>

                  <div>
                    <small>Orders Today</small>
                    <h3>18</h3>
                  </div>

                  <div>
                    <small>Products</small>
                    <h3>32</h3>
                  </div>

                  <div>
                    <small>Pending</small>
                    <h3>4</h3>
                  </div>

                </div>

                <div className="mini-bars mt-4">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-5">
        <div className="container">

          <div className="text-center mb-5">
            <span className="eyebrow">
              CORE FEATURES
            </span>

            <h2 className="fw-bold mt-2">
              Everything Your Shop Needs
            </h2>

            <p className="text-secondary mt-2">
              Simple tools. One powerful digital storefront.
            </p>
          </div>

          <div className="row g-4">

            {/* CREATE SHOP */}
            <div className="col-md-6 col-lg-4">
              <div className="feature-card feature-modern h-100">

                <div className="feature-icon">
                  🏪
                </div>

                <div className="feature-no">
                  01
                </div>

                <h5>Create Your Shop</h5>

                <p>
                  Set up your digital storefront with your
                  shop details, contact information, timings
                  and logo.
                </p>

              </div>
            </div>

            {/* PRODUCTS */}
            <div className="col-md-6 col-lg-4">
              <div className="feature-card feature-modern h-100">

                <div className="feature-icon">
                  📦
                </div>

                <div className="feature-no">
                  02
                </div>

                <h5>Products & Catalog</h5>

                <p>
                  Add products with images, prices, categories,
                  descriptions and available stock in seconds.
                </p>

              </div>
            </div>

            {/* QR */}
            <div className="col-md-6 col-lg-4">
              <div className="feature-card feature-modern h-100">

                <div className="feature-icon">
                  ◉
                </div>

                <div className="feature-no">
                  03
                </div>

                <h5>QR Shop & Share</h5>

                <p>
                  Get a unique shop link and QR code. One scan
                  opens your digital storefront instantly.
                </p>

              </div>
            </div>

            {/* ORDERS */}
            <div className="col-md-6 col-lg-4">
              <div className="feature-card feature-modern h-100">

                <div className="feature-icon">
                  🛒
                </div>

                <div className="feature-no">
                  04
                </div>

                <h5>Orders</h5>

                <p>
                  Receive customer orders online and manage
                  them easily from your vendor dashboard.
                </p>

              </div>
            </div>

            {/* PAYMENTS */}
            <div className="col-md-6 col-lg-4">
              <div className="feature-card feature-modern h-100">

                <div className="feature-icon">
                  💳
                </div>

                <div className="feature-no">
                  05
                </div>

                <h5>Payments</h5>

                <p>
                  Accept UPI payments or Cash on Delivery
                  and keep your ordering process simple.
                </p>

              </div>
            </div>

            {/* DASHBOARD */}
            <div className="col-md-6 col-lg-4">
              <div className="feature-card feature-modern h-100">

                <div className="feature-icon">
                  📊
                </div>

                <div className="feature-no">
                  06
                </div>

                <h5>Dashboard</h5>

                <p>
                  Track sales, orders, products and business
                  performance at a glance.
                </p>

              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}