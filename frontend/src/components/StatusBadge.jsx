export default function StatusBadge({ status }) {
  const meta = {
    NEW: {
      cls: "bg-primary-subtle text-primary",
      label: "New"
    },
    ACCEPTED: {
      cls: "bg-info-subtle text-info-emphasis",
      label: "Accepted"
    },
    PREPARING: {
      cls: "bg-warning-subtle text-warning-emphasis",
      label: "Preparing"
    },
    READY: {
      cls: "bg-success-subtle text-success",
      label: "Ready"
    },
    DELIVERED: {
      cls: "bg-dark text-white",
      label: "Delivered"
    }
  }[status] || {
    cls: "bg-secondary text-white",
    label: status
  };

  return (
    <span className={`badge status-badge ${meta.cls}`}>
      {meta.label}
    </span>
  );
}
