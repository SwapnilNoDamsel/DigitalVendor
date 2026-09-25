import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { BACKEND } from "../api";

const blank = {
  shopName: "",
  category: "Grocery",
  ownerName: "",
  mobile: "",
  address: "",
  openingTime: "09:00",
  closingTime: "21:00",
  upiId: ""
};

export default function ShopSetup() {
  const [form, setForm] = useState(blank);
  const [logo, setLogo] = useState(null);
  const [shop, setShop] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const nav = useNavigate();

  // =========================
  // LOAD EXISTING SHOP
  // =========================
  useEffect(() => {
    api
      .get("/shop/me")
      .then((r) => {
        if (r.data) {
          setShop(r.data);

          setForm({
            shopName: r.data.shop_name || "",
            category: r.data.category || "Grocery",
            ownerName: r.data.owner_name || "",
            mobile: r.data.mobile || "",
            address: r.data.address || "",
            openingTime:
              r.data.opening_time?.slice(0, 5) || "09:00",
            closingTime:
              r.data.closing_time?.slice(0, 5) || "21:00",
            upiId: r.data.upi_id || ""
          });
        }
      })
      .catch((e) => {
        console.error("Could not load shop:", e);
      });
  }, []);

  // =========================
  // FORM CHANGE
  // =========================
  const change = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // =========================
  // SAVE SHOP
  // =========================
  const submit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const fd = new FormData();

      fd.append("shopName", form.shopName);
      fd.append("category", form.category);
      fd.append("ownerName", form.ownerName);
      fd.append("mobile", form.mobile);
      fd.append("address", form.address);
      fd.append("openingTime", form.openingTime);
      fd.append("closingTime", form.closingTime);
      fd.append("upiId", form.upiId);

      // Only shop logo is uploaded.
      if (logo) {
        fd.append("logo", logo);
      }

      let r;

      if (shop) {
        r = await api.put("/shop", fd);

        // Reload shop after update
        const rr = await api.get("/shop/me");

        setShop(rr.data);
      } else {
        r = await api.post("/shop", fd);

        setShop({
          id: r.data.id,
          slug: r.data.slug
        });
      }

      // Clear selected logo after successful save
      setLogo(null);

    } catch (e) {
      console.error("SHOP SAVE ERROR:", e);

      setError(
        e.response?.data?.message ||
        "Something went wrong while saving the shop."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // PUBLIC SHOP URL
  // =========================
  const url = shop?.slug
    ? `${window.location.origin}/shop/${shop.slug}`
    : "";

  // =========================
  // LOGO URL
  // =========================
  const logoUrl = shop?.logo_url
    ? shop.logo_url.startsWith("http")
      ? shop.logo_url
      : `${BACKEND}${shop.logo_url}`
    : "";

  return (
    <main className="container py-5">

      <div className="row justify-content-center">

        <div className="col-lg-8">

          <div className="card border-0 shadow-sm">

            <div className="card-body p-4 p-md-5">

              {/* =========================
                  HEADER
              ========================= */}
              <div className="mb-4">

                <span className="eyebrow">
                  {shop ? "MANAGE SHOP" : "CREATE SHOP"}
                </span>

                <h2 className="fw-bold mt-2">
                  {shop
                    ? "Update your shop"
                    : "Set up your digital shop"}
                </h2>

                <p className="text-secondary mb-0">
                  Add your shop details so customers can
                  discover and order from you online.
                </p>

              </div>


              {/* =========================
                  ERROR
              ========================= */}
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}


              {/* =========================
                  EXISTING LOGO
              ========================= */}
              {logoUrl && (
                <div className="mb-4">

                  <label className="form-label">
                    Current Shop Logo
                  </label>

                  <div>
                    <img
                      src={logoUrl}
                      alt="Shop logo"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "12px"
                      }}
                    />
                  </div>

                </div>
              )}


              <form onSubmit={submit}>

                {/* =========================
                    SHOP NAME
                ========================= */}
                <label className="form-label">
                  Shop Name
                </label>

                <input
                  type="text"
                  name="shopName"
                  className="form-control mb-3"
                  placeholder="Enter shop name"
                  value={form.shopName}
                  onChange={change}
                  required
                />


                {/* =========================
                    CATEGORY
                ========================= */}
                <label className="form-label">
                  Category
                </label>

                <select
                  name="category"
                  className="form-select mb-3"
                  value={form.category}
                  onChange={change}
                  required
                >
                  <option value="Grocery">
                    Grocery
                  </option>

                  <option value="Clothing">
                    Clothing
                  </option>

                  <option value="Electronics">
                    Electronics
                  </option>

                  <option value="Pharmacy">
                    Pharmacy
                  </option>

                  <option value="Food">
                    Food
                  </option>

                  <option value="Stationery">
                    Stationery
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>


                {/* =========================
                    OWNER
                ========================= */}
                <label className="form-label">
                  Owner Name
                </label>

                <input
                  type="text"
                  name="ownerName"
                  className="form-control mb-3"
                  placeholder="Enter owner name"
                  value={form.ownerName}
                  onChange={change}
                  required
                />


                {/* =========================
                    MOBILE
                ========================= */}
                <label className="form-label">
                  Mobile Number
                </label>

                <input
                  type="tel"
                  name="mobile"
                  className="form-control mb-3"
                  placeholder="Enter mobile number"
                  value={form.mobile}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mobile: e.target.value.replace(/\D/g, "")
                    })
                  }
                  maxLength="15"
                  required
                />


                {/* =========================
                    ADDRESS
                ========================= */}
                <label className="form-label">
                  Shop Address
                </label>

                <textarea
                  name="address"
                  className="form-control mb-3"
                  placeholder="Enter complete shop address"
                  rows="3"
                  value={form.address}
                  onChange={change}
                  required
                />


                {/* =========================
                    SHOP LOGO
                ========================= */}
                <label className="form-label">
                  Shop Logo{" "}
                  <small className="text-secondary">
                    (optional)
                  </small>
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="form-control mb-3"
                  onChange={(e) =>
                    setLogo(e.target.files?.[0] || null)
                  }
                />

                <small className="text-secondary d-block mb-3">
                  JPG, PNG or WEBP. Maximum 4 MB.
                </small>


                {/* =========================
                    OPENING / CLOSING
                ========================= */}
                <div className="row">

                  <div className="col-md-6">

                    <label className="form-label">
                      Opening Time
                    </label>

                    <input
                      type="time"
                      name="openingTime"
                      className="form-control mb-3"
                      value={form.openingTime}
                      onChange={change}
                    />

                  </div>


                  <div className="col-md-6">

                    <label className="form-label">
                      Closing Time
                    </label>

                    <input
                      type="time"
                      name="closingTime"
                      className="form-control mb-3"
                      value={form.closingTime}
                      onChange={change}
                    />

                  </div>

                </div>


                {/* =========================
                    UPI ID
                ========================= */}
                <div className="mt-2">

                  <label className="form-label">
                    UPI ID{" "}
                    <small className="text-secondary">
                      (optional)
                    </small>
                  </label>

                  <input
                    type="text"
                    name="upiId"
                    className="form-control"
                    placeholder="example@upi"
                    value={form.upiId}
                    onChange={change}
                  />

                  <small className="text-secondary">
                    Customers will use the vendor's physical
                    UPI QR during checkout.
                  </small>

                </div>


                {/* =========================
                    SAVE BUTTON
                ========================= */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 mt-4"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : shop
                    ? "Update Shop"
                    : "Create Shop"}
                </button>

              </form>


              {/* =========================
                  PUBLIC SHOP
              ========================= */}
              {url && (
                <div className="alert alert-success mt-4 mb-0">

                  <b>Your shop is live!</b>

                  <div className="mt-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {url}
                    </a>
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}