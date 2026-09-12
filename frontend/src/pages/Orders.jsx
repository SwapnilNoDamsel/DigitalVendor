import { useEffect, useState } from "react";
import api from "../api";
import StatusBadge from "../components/StatusBadge";

const statuses = ["NEW", "ACCEPTED", "PREPARING", "READY", "DELIVERED"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [updatingPayment, setUpdatingPayment] = useState(null);

  const load = async () => {
    try {
      const r = await api.get("/orders/vendor");
      setOrders(r.data);
    } catch (err) {
      console.error("Could not load orders:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update order status");
    }
  };

  const updatePayment = async (id, paymentStatus) => {
    try {
      setUpdatingPayment(id);

      await api.patch(`/orders/${id}/payment`, {
        paymentStatus
      });

      await load();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Could not update payment status"
      );
    } finally {
      setUpdatingPayment(null);
    }
  };

  return (
    <main className="container py-5">
      <div className="page-head">
        <div>
          <span className="eyebrow">ORDER MANAGEMENT</span>
          <h2 className="fw-bold">Customer Orders</h2>
        </div>
      </div>

      {!orders.length && (
        <div className="empty">
          No orders yet. Orders from your public shop will appear here.
        </div>
      )}

      <div className="row g-3">
        {orders.map((o) => (
          <div className="col-lg-6" key={o.id}>
            <div className="card border-0 shadow-sm p-4">

              {/* Order Header */}
              <div className="d-flex justify-content-between align-items-start">
                <div>
                   <h5 className="mb-1">
  Order #{o.vendor_order_number}
</h5>
                  <small className="text-secondary">
                    {new Date(o.created_at).toLocaleString()}
                  </small>
                </div>

                <StatusBadge status={o.status} />
              </div>

              <hr />

              {/* Customer Details */}
              <p className="mb-1">
                <b>{o.customer_name}</b> • {o.customer_mobile}
              </p>

              <p className="small text-secondary">
                {o.delivery_address}
              </p>

              {/* Products */}
              <ul className="small">
                {o.items?.map((i) => (
                  <li key={i.id}>
                    {i.product_name} × {i.quantity} — ₹
                    {Number(i.subtotal).toFixed(2)}
                  </li>
                ))}
              </ul>

              <hr />

              {/* Total + Payment */}
              <div className="d-flex justify-content-between align-items-center">
                <b>
                  Total ₹{Number(o.total).toFixed(2)}
                </b>

                <span
                  className={
                    o.payment_status === "PAID"
                      ? "text-success fw-bold"
                      : "text-warning fw-bold"
                  }
                >
                  {o.payment_method} / {o.payment_status}
                </span>
              </div>

              {/* Payment Controls */}
              <div className="mt-3">

                {o.payment_method === "UPI" &&
                  o.payment_status === "PENDING" && (
                    <button
                      className="btn btn-success w-100"
                      disabled={updatingPayment === o.id}
                      onClick={() =>
                        updatePayment(o.id, "PAID")
                      }
                    >
                      {updatingPayment === o.id
                        ? "Confirming..."
                        : "✓ Confirm UPI Payment"}
                    </button>
                  )}

                {o.payment_method === "UPI" &&
                  o.payment_status === "PAID" && (
                    <div className="alert alert-success py-2 mb-0">
                      ✓ UPI payment confirmed
                    </div>
                  )}

                {o.payment_method === "COD" &&
                  o.payment_status === "CASH" && (
                    <div className="alert alert-success py-2 mb-0">
                      ✓ Cash payment received
                    </div>
                  )}

                {o.payment_method === "COD" &&
                  o.payment_status !== "CASH" && (
                    <button
                      className="btn btn-success w-100"
                      disabled={updatingPayment === o.id}
                      onClick={() =>
                        updatePayment(o.id, "CASH")
                      }
                    >
                      {updatingPayment === o.id
                        ? "Updating..."
                        : "✓ Mark Cash Received"}
                    </button>
                  )}

              </div>

              {/* Order Status */}
              <select
                className="form-select mt-3"
                value={o.status}
                onChange={(e) =>
                  updateStatus(o.id, e.target.value)
                }
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

            </div>
          </div>
        ))}
      </div>
    </main>
  );
}