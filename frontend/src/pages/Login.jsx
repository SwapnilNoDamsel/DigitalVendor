import {useState} from "react";
import {useNavigate,Link} from "react-router-dom";
import api from "../api";
export default function Login(){
 const [form,setForm]=useState({mobile:"",password:""}),[error,setError]=useState(""),[loading,setLoading]=useState(false); const nav=useNavigate();
const submit = async e => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // Remove any previous vendor session before logging in
    localStorage.removeItem("digitalvendor_token");

    const r = await api.post("/vendors/login", form);

    // Store only the newly authenticated vendor's token
    localStorage.setItem("digitalvendor_token", r.data.token);

    nav("/dashboard");
  } catch (e) {
    // Make sure a failed login doesn't leave an old session active
    localStorage.removeItem("digitalvendor_token");
    setError(e.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};
 return <main className="auth-page"><div className="auth-card"><div className="text-center mb-4"><div className="brand fs-3">Digital<span>Vendor</span></div><p className="text-secondary">Vendor Login</p></div>{error&&<div className="alert alert-danger">{error}</div>}<form onSubmit={submit}><label>Mobile Number</label><input className="form-control mb-3" value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} required/><label>Password</label><input type="password" className="form-control mb-4" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/><button className="btn btn-primary w-100" disabled={loading}>{loading?"Signing in...":"Login"}</button></form><p className="text-center mt-3 mb-0">New vendor? <Link to="/register">Create an account</Link></p></div></main>
}
