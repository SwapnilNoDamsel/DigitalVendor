import { useEffect, useState } from "react";
import api from "../api";
import StatusBadge from "../components/StatusBadge";

const statuses = [
  { value: "NEW", label: "New", icon: "1" },
  { value: "ACCEPTED", label: "Accepted", icon: "2" },
  { value: "PREPARING", label: "Preparing", icon: "3" },
  { value: "READY", label: "Ready", icon: "4" },
  { value: "DELIVERED", label: "Delivered", icon: "5" }
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [updatingPayment, setUpdatingPayment] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

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
      setUpdatingStatus(id);
      await api.patch(`/orders/${id}/status`, { status });
      await load();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Could not update order status"
      );
    } finally {
      setUpdatingStatus(null);
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

  const statusIndex = (status) =>
    Math.max(
      0,
      statuses.findIndex((item) => item.value === status)
    );

  return (
    <main className="container py-5">
      <div className="page-head">
        <div>
          <span className="eyebrow">ORDER MANAGEMENT</span>
          <h2 className="fw-bold">Customer Orders</h2>
          <p className="text-secondary mb-0">
            Accept orders, confirm payments and move each order through its delivery journey.
          </p>
        </div>

        <div className="catalog-count">
          <strong>{orders.length}</strong>
          <span>Orders</span>
        </div>
      </div>

      {!orders.length && (
        <div className="empty">
          <div className="fs-1 mb-2">🛒</div>
          <h5>No orders yet</h5>
          <p className="mb-0">
            Orders from your public shop will appear here.
          </p>
        </div>
      )}

      <div className="row g-4">
        {orders.map((o) => {
          const currentIndex = statusIndex(o.status);

          return (
            <div className="col-xl-6" key={o.id}>
              <div className="card order-card border-0 shadow-sm h-100">

                {/* Header */}
                <div className="p-4 pb-3">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <span className="dashboard-label">
                        ORDER #{o.vendor_order_number}
                      </span>

                      <h5 className="mb-1 mt-1">
                        {o.customer_name}
                      </h5>

                      <small className="text-secondary">
                        {new Date(o.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}
                      </small>
                    </div>

                    <StatusBadge status={o.status} />
                  </div>
                </div>

                {/* Customer */}
                <div className="order-customer-strip mx-4">
                  <div>
                    <small>Customer</small>
                    <strong>{o.customer_mobile}</strong>
                  </div>

                  <div>
                    <small>Delivery</small>
                    <strong>{o.delivery_address}</strong>
                  </div>
                </div>

                {/* Items */}
                <div className="px-4 pt-3">
                  <span className="dashboard-label">ITEMS</span>

                  <div className="order-items-list mt-2">
                    {o.items?.map((i) => (
                      <div
                        className="order-item-row"
                        key={i.id}
                      >
                        <div>
                          <strong>{i.product_name}</strong>
                          <span> × {i.quantity}</span>
                        </div>

                        <b>
                          ₹{Number(i.subtotal).toFixed(2)}
                        </b>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total + payment */}
                <div className="order-total-row mx-4 mt-3">
                  <span>Total</span>
                  <strong>
                    ₹{Number(o.total).toFixed(2)}
                  </strong>
                </div>

                <div className="px-4 pt-3">
                  <div className="payment-summary">
                    <div>
                      <small>Payment method</small>
                      <strong>
                        {o.payment_method === "UPI"
                          ? "UPI"
                          : "Cash on Delivery"}
                      </strong>
                    </div>

                    <span
                      className={
                        o.payment_status === "PAID" ||
                        o.payment_status === "CASH"
                          ? "payment-confirmed"
                          : "payment-pending"
                      }
                    >
                      {o.payment_status === "PAID"
                        ? "✓ Paid"
                        : o.payment_status === "CASH"
                        ? "✓ Cash Received"
                        : "Payment Pending"}
                    </span>
                  </div>
                </div>

                {/* Payment control */}
                <div className="px-4 pt-3">
                  {o.payment_method === "UPI" &&
                    o.payment_status === "PENDING" && (
                      <div>
                        <div className="small text-secondary mb-2">
                          UPI is a demo confirmation flow. Verify the payment in the customer's UPI app/bank before confirming it here.
                        </div>

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
                      </div>
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

                {/* Status flow */}
                <div className="px-4 pt-4 pb-4">
                  <div className="order-status-flow">
                    {statuses.map((item, index) => {
                      const active = index <= currentIndex;
                      const current =
                        index === currentIndex;

                      return (
                        <button
                          type="button"
                          key={item.value}
                          className={`order-status-step ${
                            active ? "active" : ""
                          } ${current ? "current" : ""}`}
                          disabled={
                            updatingStatus === o.id ||
                            index > currentIndex + 1
                          }
                          onClick={() =>
                            updateStatus(
                              o.id,
                              item.value
                            )
                          }
                          title={
                            index > currentIndex + 1
                              ? "Complete the previous step first"
                              : `Set status to ${item.label}`
                          }
                        >
                          <span>{item.icon}</span>
                          <small>{item.label}</small>
                        </button>
                      );
                    })}
                  </div>

                  <p className="small text-secondary text-center mb-0 mt-3">
                    Move the order from New → Accepted → Preparing → Ready → Delivered.
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
