import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api, { BACKEND } from "../api";

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
    ...new Set(
      products
        .map((p) => p.category)
        .filter(Boolean)
    )
  ];

  const visible = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "All" || p.category === cat) &&
          p.name
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [products, cat, search]
  );

  const cartItems = Object.entries(cart)
    .map(([id, quantity]) => {
      const p = products.find(
        (x) => x.id === Number(id)
      );

      return p ? { ...p, quantity } : null;
    })
    .filter(Boolean);

  const total = cartItems.reduce(
    (s, p) =>
      s + Number(p.price) * p.quantity,
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
      [p.id]: Math.min(
        p.stock,
        (cart[p.id] || 0) + 1
      )
    });

  return (
    <main className="pb-5">

      {/* SHOP HEADER */}
      <section className="shop-cover">
        <div className="container py-5">

          <div className="shop-profile">

            {shop.logo_url ? (
              <img
                src={BACKEND + shop.logo_url}
                alt={shop.shop_name}
              />
            ) : (
              <div className="shop-logo-fallback">
                {shop.shop_name[0]}
              </div>
            )}

            <div>
              <span className="eyebrow">
                {shop.category}
              </span>

              <h1 className="fw-bold">
                {shop.shop_name}
              </h1>

              <p className="mb-1">
                {shop.address}
              </p>

              <small>
                Open{" "}
                {shop.opening_time?.slice(0, 5)}
                {" – "}
                {shop.closing_time?.slice(0, 5)}
              </small>
            </div>

          </div>

        </div>
      </section>


      {/* PRODUCTS */}
      <div className="container mt-4">

        <div className="d-flex flex-wrap gap-2 mb-4">

          <input
            className="form-control search"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
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

                {p.image_url ? (
                  <img
                    src={BACKEND + p.image_url}
                    className="public-product-img"
                    alt={p.name}
                  />
                ) : (
                  <div className="product-placeholder">
                    No Image
                  </div>
                )}

                <div className="p-3">

                  <span className="small text-secondary">
                    {p.category}
                  </span>

                  <h5 className="mt-1">
                    {p.name}
                  </h5>

                  <p className="small text-secondary">
                    {p.description}
                  </p>

                  <div className="d-flex justify-content-between align-items-center">

                    <b>
                      ₹{Number(p.price).toFixed(2)}
                    </b>

                    {p.stock > 0 ? (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => add(p)}
                      >
                        Add
                      </button>
                    ) : (
                      <span className="badge bg-secondary">
                        Unavailable
                      </span>
                    )}

                  </div>

                  <small className="text-secondary">
                    {p.stock} available
                  </small>

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


      {/* CART BAR */}
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


      {/* CHECKOUT */}
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


/* =========================================================
   CHECKOUT
   ========================================================= */

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

  useEffect(() => {
    if (location.search.includes("checkout")) {
      setOpen(true);
    }
  }, [location.search]);


  /*
   * The backend may expose the uploaded vendor QR
   * using one of these names.
   *
   * We support all of them so the frontend is
   * flexible with the current database/API response.
   */
  const qrPath =
    shop?.upi_qr_url ||
    shop?.upi_qr ||
    shop?.upiQr ||
    shop?.upi_qr_image ||
    shop?.upi_qr_image_url ||
    null;


  /*
   * Convert a relative backend image path into
   * the complete backend URL.
   */
  const qrUrl = qrPath
    ? qrPath.startsWith("http")
      ? qrPath
      : `${BACKEND}${qrPath.startsWith("/") ? "" : "/"}${qrPath}`
    : "";


  /*
   * Vendor UPI ID
   */
  const upiId =
    shop?.upi_id ||
    shop?.upiId ||
    "";


  const place = async (e) => {
    e.preventDefault();

    setErr("");

    try {
      const r = await api.post("/orders", {
        shopId: shop.id,
        ...form,
        items: cartItems.map((x) => ({
          productId: x.id,
          quantity: x.quantity
        }))
      });

      setDone(r.data);

      clear();

    } catch (e) {
      setErr(
        e.response?.data?.message ||
          "Could not place order"
      );
    }
  };


  if (!open) return null;


  return (
    <div className="modal-backdrop-custom">

      <div className="checkout-modal">

        {done ? (

          /* =================================================
             ORDER SUCCESS
             ================================================= */

          <>
            <h3>
              Order placed 🎉
            </h3>

            <p>
              Your order number is{" "}
              <b>
                #{done.orderId}
              </b>
              .
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
          </>

        ) : (

          /* =================================================
             CHECKOUT FORM
             ================================================= */

          <>

            <div className="d-flex justify-content-between">

              <h4>
                Checkout
              </h4>

              <button
                className="btn-close"
                onClick={() =>
                  setOpen(false)
                }
              />

            </div>


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
                    customerName:
                      e.target.value
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
                    customerMobile:
                      e.target.value
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
                    deliveryAddress:
                      e.target.value
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
                  setForm({
                    ...form,
                    paymentMethod:
                      e.target.value
                  })
                }
              >

                <option value="COD">
                  Cash on Delivery
                </option>

                <option value="UPI">
                  UPI
                </option>

              </select>


              {/* =================================================
                 UPI PAYMENT SECTION
                 ================================================= */}

              {form.paymentMethod === "UPI" && (

                <div className="mt-3">

                  <div className="card border-0 shadow-sm">

                    <div className="card-body text-center">

                      <h5 className="fw-bold mb-2">
                        Pay via UPI
                      </h5>

                      <p className="text-secondary mb-3">
                        Scan the QR code below using
                        Google Pay, PhonePe, Paytm,
                        or another UPI app.
                      </p>


                      {/* VENDOR QR */}
                      {qrUrl ? (

                        <>

                          <div className="p-3 bg-white rounded d-inline-block border">

                            <img
                              src={qrUrl}
                              alt={`${shop.shop_name} UPI QR`}
                              style={{
                                width: "220px",
                                height: "220px",
                                objectFit: "contain"
                              }}
                            />

                          </div>

                          <p className="small text-secondary mt-3 mb-1">
                            Pay to
                          </p>

                          <strong>
                            {shop.shop_name}
                          </strong>

                        </>

                      ) : (

                        <div className="alert alert-warning text-start">

                          <strong>
                            UPI QR not available
                          </strong>

                          <br />

                          The shop owner has not uploaded
                          a UPI QR code yet.

                        </div>

                      )}


                      {/* UPI ID */}
                      {upiId && (

                        <div className="mt-3 p-3 bg-light rounded">

                          <small className="text-secondary d-block">
                            UPI ID
                          </small>

                          <strong>
                            {upiId}
                          </strong>

                        </div>

                      )}


                      {/* AMOUNT */}
                      <div className="mt-3 p-3 bg-light rounded">

                        <span className="text-secondary">
                          Amount to Pay
                        </span>

                        <h4 className="mb-0 mt-1">
                          ₹{total.toFixed(2)}
                        </h4>

                      </div>


                      <div className="alert alert-info mt-3 mb-0 text-start small">

                        After completing the UPI payment,
                        continue below to place your order.

                      </div>

                    </div>

                  </div>

                </div>

              )}


              {/* TOTAL */}
              <div className="mt-3 p-3 bg-light rounded">

                <b>
                  Total ₹{total.toFixed(2)}
                </b>

              </div>


              {/* PLACE ORDER */}
              <button
                className="btn btn-primary w-100 mt-3"
                disabled={
                  form.paymentMethod === "UPI" &&
                  !qrUrl &&
                  !upiId
                }
              >
                {form.paymentMethod === "UPI"
                  ? "I've Paid — Place Order"
                  : "Place Order"}
              </button>

            </form>

          </>

        )}

      </div>

    </div>
  );
}