export default function StatusBadge({status}){
  const cls={NEW:"bg-primary",ACCEPTED:"bg-info",PREPARING:"bg-warning text-dark",READY:"bg-success",DELIVERED:"bg-dark"}[status]||"bg-secondary";
  return <span className={`badge ${cls}`}>{status}</span>;
}
