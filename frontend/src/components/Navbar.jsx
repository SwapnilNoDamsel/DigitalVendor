import { Link, useNavigate } from "react-router-dom";

export default function Navbar(){
  const nav=useNavigate();
  const logged=!!localStorage.getItem("digitalvendor_token");
  const logout=()=>{localStorage.removeItem("digitalvendor_token"); nav("/");};
  return <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
    <div className="container py-2">
      <Link className="navbar-brand fw-bold brand" to="/">Digital<span>Vendor</span></Link>
      <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav">☰</button>
      <div className="collapse navbar-collapse" id="nav">
        <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
          <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
          {logged ? <>
            <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/products">Products</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/orders">Orders</Link></li>
            <li className="nav-item"><button className="btn btn-outline-dark btn-sm" onClick={logout}>Logout</button></li>
          </> : <>
            <li className="nav-item"><Link className="nav-link" to="/login">Vendor Login</Link></li>
            <li className="nav-item"><Link className="btn btn-primary btn-sm px-3" to="/register">Create Shop</Link></li>
          </>}
        </ul>
      </div>
    </div>
  </nav>
}
