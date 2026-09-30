import { useEffect, useState } from "react";
import api from "../api";
import { assetUrl, productEmoji } from "../utils/product";

const emptyForm = {
  name: "",
  price: "",
  category: "General",
  description: "",
  stock: ""
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    api
      .get("/products")
      .then((r) => setProducts(r.data))
      .catch((e) =>
        setError(
          e.response?.data?.message ||
            "Could not load products"
        )
      );

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(image);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const resetForm = () => {
    setForm(emptyForm);
    setImage(null);
    setPreview("");
    setEditing(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, value);
      });

      if (image) {
        fd.append("image", image);
      }

      if (editing) {
        await api.put(`/products/${editing}`, fd);
      } else {
        await api.post("/products", fd);
      }

      resetForm();
      await load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not save product"
      );
    } finally {
      setSaving(false);
    }
  };

  const edit = (p) => {
    setEditing(p.id);

    setForm({
      name: p.name,
      price: p.price,
      category: p.category || "General",
      description: p.description || "",
      stock: p.stock
    });

    setImage(null);
    setPreview(p.image_url ? assetUrl(p.image_url) : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const del = async (id) => {
    if (!confirm("Delete this product?")) return;

    try {
      await api.delete(`/products/${id}`);
      await load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not delete product"
      );
    }
  };

  return (
    <main className="container py-5">
      <div className="page-head">
        <div>
          <span className="eyebrow">PRODUCT CATALOG</span>
          <h2 className="fw-bold">Manage Products</h2>
          <p className="text-secondary mb-0">
            Add clear product details and images so customers know exactly what you sell.
          </p>
        </div>

        <div className="catalog-count">
          <strong>{products.length}</strong>
          <span>Products</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="row g-4">
        {/* PRODUCT FORM */}
        <div className="col-lg-5">
          <form
            className="card border-0 shadow-sm p-4 sticky-lg-top product-form-card"
            style={{ top: 90 }}
            onSubmit={submit}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="dashboard-label">
                  {editing ? "EDIT CATALOG ITEM" : "NEW CATALOG ITEM"}
                </span>
                <h5 className="mb-1">
                  {editing ? "Edit Product" : "Add Product"}
                </h5>
              </div>

              {editing && (
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>

            <label className="mt-3">Product Name</label>
            <input
              className="form-control"
              value={form.name}
              placeholder="e.g. Basmati Rice"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />

            <label className="mt-3">Price (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="form-control"
              value={form.price}
              placeholder="e.g. 120"
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              required
            />

            <label className="mt-3">Category</label>
            <input
              className="form-control"
              value={form.category}
              placeholder="e.g. Grocery"
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            />

            <label className="mt-3">Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={form.description}
              placeholder="Short customer-friendly description"
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value
                })
              }
            />

            <label className="mt-3">Available Quantity</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={form.stock}
              placeholder="e.g. 25"
              onChange={(e) =>
                setForm({ ...form, stock: e.target.value })
              }
              required
            />

            <label className="mt-3">Product Image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="form-control"
              onChange={(e) =>
                setImage(e.target.files?.[0] || null)
              }
            />

            <small className="text-secondary mt-2">
              JPG, PNG or WEBP · maximum 4 MB. Product images are stored securely in Cloudinary.
            </small>

            {(preview || form.name) && (
              <div className="product-upload-preview mt-3">
                {preview ? (
                  <img
                    src={preview}
                    alt="Product preview"
                  />
                ) : (
                  <div className="product-fallback-large">
                    <span>{productEmoji(form)}</span>
                    <small>Image preview</small>
                  </div>
                )}

                <div>
                  <strong>{form.name || "Product preview"}</strong>
                  <small>
                    {form.category || "General"} · ₹
                    {Number(form.price || 0).toFixed(2)}
                  </small>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary mt-4"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editing
                ? "Update Product"
                : "Add Product"}
            </button>
          </form>
        </div>

        {/* PRODUCT GRID */}
        <div className="col-lg-7">
          <div className="row g-3">
            {products.map((p) => {
              const lowStock =
                Number(p.stock) <= 5 &&
                Number(p.stock) > 0;

              return (
                <div className="col-md-6" key={p.id}>
                  <div className="card product-admin h-100 border-0 shadow-sm">
                    <div className="product-image-wrap">
                      {p.image_url ? (
                        <img
                          src={assetUrl(p.image_url)}
                          className="product-img"
                          alt={p.name}
                        />
                      ) : (
                        <div className="product-placeholder product-fallback">
                          <span>{productEmoji(p)}</span>
                          <small>{p.category || "Product"}</small>
                        </div>
                      )}

                      {lowStock && (
                        <span className="low-stock-badge product-stock-badge">
                          LOW STOCK
                        </span>
                      )}

                      {Number(p.stock) <= 0 && (
                        <span className="out-of-stock-badge product-stock-badge">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>

                    <div className="p-3">
                      <div className="d-flex justify-content-between gap-2">
                        <div>
                          <span className="small text-secondary">
                            {p.category || "General"}
                          </span>
                          <h6 className="fw-bold mb-0 mt-1">
                            {p.name}
                          </h6>
                        </div>

                        <b className="text-nowrap">
                          ₹{Number(p.price).toFixed(2)}
                        </b>
                      </div>

                      <p className="small text-secondary mt-2 mb-2 product-description">
                        {p.description || "No description added yet."}
                      </p>

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span
                          className={
                            Number(p.stock) <= 5
                              ? "small text-danger fw-semibold"
                              : "small text-secondary"
                          }
                        >
                          {Number(p.stock) <= 5
                            ? `Only ${p.stock} left`
                            : `${p.stock} in stock`}
                        </span>

                        <span className="small text-secondary">
                          {p.is_available ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary flex-grow-1"
                          onClick={() => edit(p)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => del(p.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!products.length && (
            <div className="empty">
              <div className="fs-1 mb-2">📦</div>
              <h5>No products yet</h5>
              <p className="mb-0">
                Add your first product with a clear image, price and stock quantity.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
