import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-5">

            {/* LEFT */}
            <div className="col-lg-7">

              <span className="eyebrow">
                DIGITAL TOOLS FOR LOCAL BUSINESSES
              </span>

              <h1 className="mt-4">
                Bring your local shop{" "}
                <span className="text-primary">
                  online.
                </span>
              </h1>

              <p className="lead mt-4">
                DigitalVendor gives small vendors a simple digital
                storefront to showcase products, share their shop,
                receive orders and manage their business — all in one place.
              </p>

              <div className="d-flex flex-wrap gap-3 mt-4">

                <Link
                  className="btn btn-primary btn-lg"
                  to="/register"
                >
                  Create My Shop →
                </Link>

                <a
                  className="btn btn-outline-dark btn-lg"
                  href="#features"
                >
                  Explore Features
                </a>

              </div>

              <div className="d-flex flex-wrap gap-4 mt-4 small text-secondary">

                <span>
                  ✓ No customer registration
                </span>

                <span>
                  ✓ QR-powered storefront
                </span>

                <span>
                  ✓ Simple vendor dashboard
                </span>

              </div>

            </div>


            {/* RIGHT — DASHBOARD PREVIEW */}
            <div className="col-lg-5">

              <div className="mock-dashboard">

                <div className="d-flex justify-content-between align-items-center">

                  <div>
                    <small className="text-secondary">
                      YOUR DIGITAL STORE
                    </small>

                    <h4 className="mb-0 mt-1">
                      Vendor Dashboard
                    </h4>
                  </div>

                  <span className="badge bg-success-subtle text-success">
                    ● Live
                  </span>

                </div>


                <div className="metric-grid mt-4">

                  <div>
                    <small>Today's Sales</small>
                    <h3>₹2,450</h3>
                  </div>

                  <div>
                    <small>Orders</small>
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


                <div className="mt-4">

                  <div className="d-flex justify-content-between mb-2">

                    <small className="text-secondary">
                      Weekly activity
                    </small>

                    <small className="text-success fw-semibold">
                      +24.8%
                    </small>

                  </div>

                  <div className="mini-bars">
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
        </div>
      </section>


      {/* =====================================================
          STATS
      ===================================================== */}
      <section className="dv-stats">

        <div className="container-fluid">

          <div className="row g-0">

            <div className="col-6 col-lg-3">
              <div className="dv-stat">
                <strong>6</strong>
                <span>Core Business Tools</span>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="dv-stat">
                <strong>1</strong>
                <span>Digital Storefront</span>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="dv-stat">
                <strong>24/7</strong>
                <span>Customer Access</span>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="dv-stat">
                <strong>0</strong>
                <span>Customer Registration Required</span>
              </div>
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ABOUT DIGITALVENDOR
      ===================================================== */}
      <section className="dv-section dv-section-white">

        <div className="container">

          <div className="row align-items-center g-5">

            {/* LEFT CARD */}
            <div className="col-lg-6">

              <div className="dv-story-card">

                <div className="fs-1 mb-4">
                  🏪
                </div>

                <h3>
                  From local shop
                  <br />
                  to digital storefront.
                </h3>

                <p className="mt-4">
                  Small businesses shouldn't need complicated
                  technology to start selling online.
                </p>

                <p>
                  DigitalVendor brings the essential digital tools
                  together so vendors can create, manage and share
                  their online shop with ease.
                </p>

              </div>

            </div>


            {/* RIGHT */}
            <div className="col-lg-6">

              <span className="dv-eyebrow">
                ABOUT DIGITALVENDOR
              </span>

              <h2 className="dv-section-title">
                Digital business
                <span className="text-primary">
                  made simple.
                </span>
              </h2>

              <p className="dv-section-subtitle mt-4">
                DigitalVendor is designed for small vendors who want
                to take their first step towards selling and managing
                their business digitally.
              </p>

              <div className="mt-4">

                <div className="dv-check">
                  <span>✓</span>
                  Simple vendor registration
                </div>

                <div className="dv-check">
                  <span>✓</span>
                  Easy product and catalog management
                </div>

                <div className="dv-check">
                  <span>✓</span>
                  Shareable shop link and QR code
                </div>

                <div className="dv-check">
                  <span>✓</span>
                  Online order management
                </div>

                <div className="dv-check">
                  <span>✓</span>
                  Sales and business dashboard
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section
        id="features"
        className="dv-section dv-section-light"
      >

        <div className="container">

          <div className="text-center mb-5">

            <span className="dv-eyebrow">
              EVERYTHING YOUR SHOP NEEDS
            </span>

            <h2 className="dv-section-title">
              One platform.
              <br />
              <span className="text-primary">
                Complete digital storefront.
              </span>
            </h2>

            <p className="dv-section-subtitle mx-auto mt-3">
              From creating your shop to managing orders,
              DigitalVendor keeps the important parts of your
              digital business in one place.
            </p>

          </div>


          <div className="row g-4">

            {/* 01 */}
            <div className="col-md-6 col-lg-4">

              <div className="feature-card feature-modern h-100">

                <div className="feature-icon">
                  🏪
                </div>

                <div className="feature-no">
                  01
                </div>

                <h5>
                  Create Your Shop
                </h5>

                <p>
                  Build your digital storefront with your shop
                  name, details, contact information, timings
                  and branding.
                </p>

              </div>

            </div>


            {/* 02 */}
            <div className="col-md-6 col-lg-4">

              <div className="feature-card feature-modern h-100">

                <div className="feature-icon">
                  📦
                </div>

                <div className="feature-no">
                  02
                </div>

                <h5>
                  Products & Catalog
                </h5>

                <p>
                  Add products with names, prices, images,
                  categories and descriptions so customers can
                  easily browse your catalog.
                </p>

              </div>

            </div>


            {/* 03 */}
            <div className="col-md-6 col-lg-4">

              <div className="feature-card feature-modern h-100">

                <div className="feature-icon">
                  ◉
                </div>

                <div className="feature-no">
                  03
                </div>

                <h5>
                  QR Shop & Share
                </h5>

                <p>
                  Get a unique shop link and QR code that can
                  be shared with customers through WhatsApp,
                  social media or printed materials.
                </p>

              </div>

            </div>


            {/* 04 */}
            <div className="col-md-6 col-lg-4">

              <div className="feature-card feature-modern h-100">

                <div className="feature-icon">
                  🛒
                </div>

                <div className="feature-no">
                  04
                </div>

                <h5>
                  Receive Orders
                </h5>

                <p>
                  Customers can browse your products, add items
                  to their cart and place orders without creating
                  an account.
                </p>

              </div>

            </div>


            {/* 05 */}
            <div className="col-md-6 col-lg-4">

              <div className="feature-card feature-modern h-100">

                <div className="feature-icon">
                  💳
                </div>

                <div className="feature-no">
                  05
                </div>

                <h5>
                  Payments
                </h5>

                <p>
                  Keep the checkout process simple with supported
                  payment options including UPI and Cash on Delivery.
                </p>

              </div>

            </div>


            {/* 06 */}
            <div className="col-md-6 col-lg-4">

              <div className="feature-card feature-modern h-100">

                <div className="feature-icon">
                  📊
                </div>

                <div className="feature-no">
                  06
                </div>

                <h5>
                  Business Dashboard
                </h5>

                <p>
                  Manage products, monitor orders and keep track
                  of your digital storefront from one dashboard.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}
      <section className="dv-section dv-section-white">

        <div className="container">

          <div className="row align-items-end mb-5">

            <div className="col-lg-7">

              <span className="dv-eyebrow">
                HOW IT WORKS
              </span>

              <h2 className="dv-section-title">
                Get your shop
                <span className="text-primary">
                  online in simple steps.
                </span>
              </h2>

            </div>

            <div className="col-lg-5">

              <p className="dv-section-subtitle mb-0">
                DigitalVendor keeps the setup process simple so
                vendors can focus on their customers and business.
              </p>

            </div>

          </div>


          <div className="row g-4">

            <div className="col-md-6 col-lg-3">

              <div className="dv-process-card">

                <div className="dv-process-number">
                  01
                </div>

                <h4>
                  Create Account
                </h4>

                <p>
                  Register as a vendor and securely access
                  your DigitalVendor dashboard.
                </p>

              </div>

            </div>


            <div className="col-md-6 col-lg-3">

              <div className="dv-process-card">

                <div className="dv-process-number">
                  02
                </div>

                <h4>
                  Build Your Shop
                </h4>

                <p>
                  Add your shop information and create
                  your digital storefront.
                </p>

              </div>

            </div>


            <div className="col-md-6 col-lg-3">

              <div className="dv-process-card">

                <div className="dv-process-number">
                  03
                </div>

                <h4>
                  Add Products
                </h4>

                <p>
                  Upload your products, prices and catalog
                  information for customers to browse.
                </p>

              </div>

            </div>


            <div className="col-md-6 col-lg-3">

              <div className="dv-process-card">

                <div className="dv-process-number">
                  04
                </div>

                <h4>
                  Share & Sell
                </h4>

                <p>
                  Share your shop link or QR code and start
                  receiving customer orders.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          WHY DIGITALVENDOR
      ===================================================== */}
      <section className="dv-section dv-section-light">

        <div className="container">

          <div className="row align-items-center g-5">

            <div className="col-lg-6">

              <span className="dv-eyebrow">
                BUILT FOR SMALL VENDORS
              </span>

              <h2 className="dv-section-title">
                Technology shouldn't
                <span className="text-primary">
                  feel complicated.
                </span>
              </h2>

              <p className="dv-section-subtitle mt-4">
                DigitalVendor focuses on the essentials — a
                storefront, products, orders, payments and
                business management — without unnecessary complexity.
              </p>

            </div>


            <div className="col-lg-6">

              <div className="row g-3">

                <div className="col-6">

                  <div className="dv-process-card">
                    <div className="fs-2 mb-3">
                      📱
                    </div>

                    <h4>
                      Mobile Friendly
                    </h4>

                    <p>
                      Manage your digital shop from your
                      phone or computer.
                    </p>
                  </div>

                </div>


                <div className="col-6">

                  <div className="dv-process-card">
                    <div className="fs-2 mb-3">
                      ⚡
                    </div>

                    <h4>
                      Simple Setup
                    </h4>

                    <p>
                      Create your storefront without
                      complicated technical steps.
                    </p>
                  </div>

                </div>


                <div className="col-6">

                  <div className="dv-process-card">
                    <div className="fs-2 mb-3">
                      🔗
                    </div>

                    <h4>
                      Easy Sharing
                    </h4>

                    <p>
                      Share your store through a link
                      or QR code.
                    </p>
                  </div>

                </div>


                <div className="col-6">

                  <div className="dv-process-card">
                    <div className="fs-2 mb-3">
                      🛍️
                    </div>

                    <h4>
                      Customer Ready
                    </h4>

                    <p>
                      Customers can browse and order
                      without signing up.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="dv-cta">

        <div className="container">

          <span className="dv-eyebrow">
            START YOUR DIGITAL JOURNEY
          </span>

          <h2 className="mt-4">
            Ready to take your shop
            <span className="text-primary">
              online?
            </span>
          </h2>

          <p>
            Create your DigitalVendor account, set up your
            storefront and give your customers a simple way
            to discover and order from your shop.
          </p>

          <Link
            to="/register"
            className="btn btn-primary btn-lg"
          >
            Create My Shop →
          </Link>

          <div className="mt-3">
            <small className="text-secondary">
              Already have an account?{" "}
              <Link to="/login">
                Login here
              </Link>
            </small>
          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="dv-footer">

        <div className="container">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">

            <div>

              <div className="brand fs-4">
                Digital<span>Vendor</span>
              </div>

              <p className="mt-1">
                Helping local businesses go digital.
              </p>

            </div>

            <p>
              © {new Date().getFullYear()} DigitalVendor.
              All rights reserved.
            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}