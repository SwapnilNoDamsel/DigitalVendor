import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import api from "../api";
import { assetUrl, productEmoji } from "../utils/product";

export default function PublicShop() {
  const { slug } = useParams();
  const nav = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [cart, setCart] = useState({});

  useEffect(() => {
    api
      .get(`/shop/public/${slug}`)
      .then((r) => setData(r.data))
      .catch(() => setData({ error: true }));
  }, [slug]);

  const products = data?.products || [];

  const cats = [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean))
  ];

  const visible = useMemo(() => {
    return products.filter(
      (p) =>
        (cat === "All" || p.category === cat) &&
        p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, cat, search]);

  const cartItems = Object.entries(cart)
    .map(([id, quantity]) => {
      const p = products.find((x) => x.id === Number(id));
      return p ? { ...p, quantity } : null;
    })
    .filter(Boolean);

  const total = cartItems.reduce(
    (s, p) => s + Number(p.price) * p.quantity,
    0
  );

  if (!data) {
    return (
      <main className="container py-5 text-center">
        Loading shop...
      </main>
    );
  }

  if (data.error) {
    return (
      <main className="container py-5 text-center">
        <h2>Shop not found</h2>
      </main>
    );
  }

  const shop = data.shop;

  const add = (p) =>
    setCart({
      ...cart,
      [p.id]: Math.min(p.stock, (cart[p.id] || 0) + 1)
    });

  return (
    <main className="pb-5">

      {/* =========================
          SHOP HEADER
      ========================= */}
      <section className="shop-cover">
        <div className="container py-5">

          <div className="shop-profile">

            {shop.logo_url ? (
              <img
                src={assetUrl(shop.logo_url)}
                alt={shop.shop_name}
              />
            ) : (
              <div className="shop-logo-fallback">
                {shop.shop_name[0]}
              </div>
            )}

            <div className="flex-grow-1">
              <span className="eyebrow">
                {shop.category}
              </span>

              <h1 className="fw-bold mb-2">
                {shop.shop_name}
              </h1>

              <p className="mb-2 text-secondary">
                📍 {shop.address}
              </p>

              <div className="shop-meta-row">
                <span>
                  🕘 {shop.opening_time?.slice(0, 5)} –{" "}
                  {shop.closing_time?.slice(0, 5)}
                </span>

                {shop.owner_name && (
                  <span>👤 {shop.owner_name}</span>
                )}

                {shop.mobile && (
                  <span>📞 {shop.mobile}</span>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =========================
          PRODUCTS
      ========================= */}
      <div className="container mt-4">

        <div className="d-flex flex-wrap gap-2 mb-4">

          <input
            className="form-control search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {cats.map((c) => (
            <button
              key={c}
              className={`btn ${
                cat === c
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}

        </div>


        <div className="row g-4">

          {visible.map((p) => (

            <div
              className="col-6 col-md-4 col-lg-3"
              key={p.id}
            >

              <div className="card product-card h-100 border-0 shadow-sm">

                <div className="product-image-wrap">
                  {p.image_url ? (
                    <img
                      src={assetUrl(p.image_url)}
                      className="public-product-img"
                      alt={p.name}
                    />
                  ) : (
                    <div className="product-placeholder product-fallback">
                      <span>{productEmoji(p)}</span>
                      <small>{p.category || "Product"}</small>
                    </div>
                  )}

                  {Number(p.stock) <= 5 && Number(p.stock) > 0 && (
                    <span className="low-stock-badge product-stock-badge">
                      ONLY {p.stock} LEFT
                    </span>
                  )}
                </div>

                <div className="p-3 d-flex flex-column">

                  <span className="small text-secondary">
                    {p.category || "General"}
                  </span>

                  <h5 className="mt-1 mb-1">
                    {p.name}
                  </h5>

                  <p className="small text-secondary product-description mb-3">
                    {p.description || "Quality product from this local shop."}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-auto">

                    <div>
                      <b className="fs-5">
                        ₹{Number(p.price).toFixed(2)}
                      </b>
                      <div className="small text-secondary">
                        {Number(p.stock) > 0
                          ? `${p.stock} available`
                          : "Currently unavailable"}
                      </div>
                    </div>

                    {p.stock > 0 ? (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => add(p)}
                      >
                        Add to cart
                      </button>
                    ) : (
                      <span className="badge bg-secondary">
                        Unavailable
                      </span>
                    )}

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>


        {!visible.length && (
          <div className="empty">
            No matching products found.
          </div>
        )}

      </div>


      {/* =========================
          CART BAR
      ========================= */}
      {cartItems.length > 0 && (

        <div className="cart-bar shadow-lg">

          <div>
            <b>
              {cartItems.reduce(
                (s, p) => s + p.quantity,
                0
              )}{" "}
              items
            </b>

            <span className="ms-3">
              ₹{total.toFixed(2)}
            </span>
          </div>

          <button
            className="btn btn-primary"
            onClick={() =>
              nav(`/shop/${slug}?checkout=1`, {
                state: {
                  cart: cartItems
                }
              })
            }
          >
            Checkout
          </button>

        </div>

      )}


      {/* =========================
          CHECKOUT
      ========================= */}
      <Checkout
        shop={shop}
        cartItems={cartItems}
        total={total}
        clear={() => setCart({})}
        location={location}
      />

    </main>
  );
}


/* =====================================================
   CHECKOUT COMPONENT
===================================================== */

function Checkout({
  shop,
  cartItems,
  total,
  clear,
  location
}) {

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerMobile: "",
    deliveryAddress: "",
    paymentMethod: "COD"
  });

  const [done, setDone] = useState(null);
  const [err, setErr] = useState("");

  const [scanner, setScanner] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [paymentLink, setPaymentLink] = useState("");

  /* =========================
     OPEN CHECKOUT
  ========================= */
  useEffect(() => {

    if (location.search.includes("checkout")) {
      setOpen(true);
    }

  }, [location.search]);


  /* =========================
     CLEANUP CAMERA
  ========================= */
  useEffect(() => {

    return () => {

      if (scanner) {

        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            scanner.clear();
          });

      }

    };

  }, [scanner]);


  /* =========================
     STOP SCANNER
  ========================= */
  const stopScanner = async () => {

    if (scanner) {

      try {
        await scanner.stop();
      } catch (e) {
        // Scanner may already be stopped
      }

      try {
        scanner.clear();
      } catch (e) {
        // Ignore
      }

      setScanner(null);
    }

    setScanning(false);
  };


  /* =========================
     START QR SCANNER
  ========================= */
  const startScanner = async () => {

    setScanMessage("");
    setQrScanned(false);
    setPaymentLink("");

    try {

      // Stop previous scanner if any
      await stopScanner();

      const qrScanner = new Html5Qrcode(
        "upi-qr-reader"
      );

      setScanner(qrScanner);

      setScanning(true);

      await qrScanner.start(

        {
          facingMode: "environment"
        },

        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250
          }
        },

        async (decodedText) => {

          console.log(
            "QR CODE DETECTED:",
            decodedText
          );

          const isPaymentLink =
            decodedText.startsWith("upi://") ||
            decodedText.startsWith("http://") ||
            decodedText.startsWith("https://");

          await stopScanner();

          if (!isPaymentLink) {
            setQrScanned(false);
            setScanMessage(
              "QR detected, but it is not a UPI payment QR."
            );
            return;
          }

          setPaymentLink(decodedText);
          setQrScanned(true);
          setScanMessage(
            "QR scanned successfully. Open the payment app, complete the payment, then place your order."
          );

        },

        () => {
          // Ignore continuous scanning errors
        }

      );

    } catch (error) {

      console.error(
        "QR SCANNER ERROR:",
        error
      );

      setScanning(false);

      setScanMessage(
        "Unable to access the camera. Please allow camera permission and try again."
      );
    }
  };


  /* =========================
     PAYMENT METHOD CHANGE
  ========================= */
  const changePaymentMethod = async (method) => {

    if (method !== "UPI") {
      await stopScanner();
      setQrScanned(false);
      setScanMessage("");
      setPaymentLink("");
    }

    setForm({
      ...form,
      paymentMethod: method
    });
  };


  /* =========================
     PLACE ORDER
  ========================= */
  const place = async (e) => {

    e.preventDefault();

    setErr("");

    /*
     * For UPI, require QR scan before placing
     * the order.
     */
    if (
      form.paymentMethod === "UPI" &&
      !qrScanned
    ) {

      setErr(
        "Please scan the vendor's UPI QR and complete the payment first."
      );

      return;
    }

    try {

      await stopScanner();

      const r = await api.post(
        "/orders",
        {
          shopId: shop.id,

          ...form,

          items: cartItems.map((x) => ({
            productId: x.id,
            quantity: x.quantity
          }))
        }
      );

      setDone(r.data);

      clear();

    } catch (e) {

      setErr(
        e.response?.data?.message ||
        "Could not place order"
      );
    }
  };


  if (!open) {
    return null;
  }


  /* =========================
     SUCCESS
  ========================= */
  if (done) {

    return (
      <div className="modal-backdrop-custom">

        <div className="checkout-modal">

          <h3>
            Order placed 🎉
          </h3>

          <p>
            Your order number is{" "}
            <b>#{done.orderId}</b>.
          </p>

          <p>
            Total:{" "}
            <b>
              ₹{Number(done.total).toFixed(2)}
            </b>
          </p>

          <a
            className="btn btn-primary"
            href={`/track/${done.orderId}`}
          >
            Track Order
          </a>

        </div>

      </div>
    );
  }


  return (
    <div className="modal-backdrop-custom">

      <div className="checkout-modal">

        {/* =========================
            HEADER
        ========================= */}
        <div className="d-flex justify-content-between">

          <h4>
            Checkout
          </h4>

          <button
            className="btn-close"
            onClick={async () => {
              await stopScanner();
              setOpen(false);
            }}
          />

        </div>


        {/* ERROR */}
        {err && (
          <div className="alert alert-danger mt-3">
            {err}
          </div>
        )}


        <form onSubmit={place}>

          {/* NAME */}
          <label className="mt-3">
            Name
          </label>

          <input
            className="form-control"
            required
            value={form.customerName}
            onChange={(e) =>
              setForm({
                ...form,
                customerName: e.target.value
              })
            }
          />


          {/* MOBILE */}
          <label className="mt-3">
            Mobile
          </label>

          <input
            className="form-control"
            required
            value={form.customerMobile}
            onChange={(e) =>
              setForm({
                ...form,
                customerMobile: e.target.value
              })
            }
          />


          {/* ADDRESS */}
          <label className="mt-3">
            Delivery Address
          </label>

          <textarea
            className="form-control"
            required
            value={form.deliveryAddress}
            onChange={(e) =>
              setForm({
                ...form,
                deliveryAddress: e.target.value
              })
            }
          />


          {/* PAYMENT METHOD */}
          <label className="mt-3">
            Payment Method
          </label>

          <select
            className="form-select"
            value={form.paymentMethod}
            onChange={(e) =>
              changePaymentMethod(e.target.value)
            }
          >

            <option value="COD">
              Cash on Delivery
            </option>

            <option value="UPI">
              UPI
            </option>

          </select>


          {/* =========================
              UPI SCANNER
          ========================= */}
          {form.paymentMethod === "UPI" && (

            <div className="mt-4">

              <div className="p-3 rounded border">

                <h5 className="mb-2">
                  📷 Scan Vendor UPI QR
                </h5>

                <p className="small text-secondary mb-3">
                  Ask the vendor to show their physical
                  UPI QR code, then scan it using your
                  phone camera.
                </p>


                {!scanning && !qrScanned && (

                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={startScanner}
                  >
                    📷 Open Camera Scanner
                  </button>

                )}


                {/* CAMERA AREA */}
                <div
                  id="upi-qr-reader"
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    margin: "15px auto 0"
                  }}
                />


                {/* SCANNING MESSAGE */}
                {scanning && (

                  <div className="text-center mt-3">

                    <p className="mb-2">
                      📷 Point your camera at the
                      vendor's QR code
                    </p>

                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={stopScanner}
                    >
                      Stop Camera
                    </button>

                  </div>

                )}


                {/* SUCCESS */}
                {qrScanned && (

                  <div className="alert alert-success mt-3 mb-0">

                    <strong>✅ QR scanned successfully.</strong>

                    <br />

                    Open the payment app, complete the payment,
                    then place the order below.

                    {paymentLink && (
                      <button
                        type="button"
                        className="btn btn-success btn-sm w-100 mt-3"
                        onClick={() => {
                          window.location.href = paymentLink;
                        }}
                      >
                        Open UPI Payment App
                      </button>
                    )}

                  </div>

                )}


                {/* SCANNER ERROR / MESSAGE */}
                {scanMessage && !qrScanned && (

                  <div className="alert alert-warning mt-3 mb-0">
                    {scanMessage}
                  </div>

                )}

              </div>

            </div>

          )}


          {/* TOTAL */}
          <div className="mt-3 p-3 bg-light rounded">

            <b>
              Total ₹{total.toFixed(2)}
            </b>

          </div>


          {/* =========================
              ORDER BUTTON
          ========================= */}
          <button
            type="submit"
            className="btn btn-primary w-100 mt-3"
            disabled={
              form.paymentMethod === "UPI" &&
              !qrScanned
            }
          >

            {form.paymentMethod === "UPI"
              ? "I've Completed Payment — Place Order"
              : "Place Order"}

          </button>

        </form>

      </div>

    </div>
  );
}