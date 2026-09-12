import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import api from "../api";
const blank={shopName:"",category:"Grocery",ownerName:"",mobile:"",address:"",openingTime:"09:00",closingTime:"21:00",upiId:""};
export default function ShopSetup(){
 const [form,setForm]=useState(blank),[logo,setLogo]=useState(null),[upiQr,setUpiQr]=useState(null),[shop,setShop]=useState(null),[error,setError]=useState(""),[saving,setSaving]=useState(false); const nav=useNavigate();
 useEffect(()=>{api.get("/shop/me").then(r=>{if(r.data){setShop(r.data);setForm({shopName:r.data.shop_name||"",category:r.data.category||"",ownerName:r.data.owner_name||"",mobile:r.data.mobile||"",address:r.data.address||"",openingTime:r.data.opening_time?.slice(0,5)||"",closingTime:r.data.closing_time?.slice(0,5)||"",upiId:r.data.upi_id||""})}})},[]);
 const submit=async e=>{e.preventDefault();setSaving(true);setError("");const fd=new FormData();Object.entries(form).forEach(([k,v])=>fd.append(k,v));if(logo)fd.append("logo",logo);if(upiQr)fd.append("upiQr",upiQr);try{const r=shop?await api.put("/shop",fd):await api.post("/shop",fd); if(!shop){setShop({slug:r.data.slug});}else{const rr=await api.get("/shop/me");setShop(rr.data)} }catch(e){setError(e.response?.data?.message||"Something went wrong")}finally{setSaving(false)}};
 const url=shop?.slug?`${location.origin}/shop/${shop.slug}`:"";
 return <main className="container py-5"><div className="page-head"><div><span className="eyebrow">SHOP SETUP</span><h2 className="fw-bold">{shop?"Edit your shop":"Create your online shop"}</h2><p className="text-secondary">No technical knowledge required.</p></div></div>{error&&<div className="alert alert-danger">{error}</div>}<form onSubmit={submit} className="card border-0 shadow-sm p-4"><div className="row g-3">
 {[
  ["shopName","Shop Name"],["ownerName","Owner Name"],["mobile","Contact Number"],["category","Shop Category"],["address","Shop Address"]
 ].map(([k,l])=><div className={k==="address"?"col-12":"col-md-6"} key={k}><label>{l}</label><input className="form-control" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required/></div>)}
 <div className="col-md-6"><label>Opening Time</label><input type="time" className="form-control" value={form.openingTime} onChange={e=>setForm({...form,openingTime:e.target.value})}/></div>
 <div className="col-md-6"><label>Closing Time</label><input type="time" className="form-control" value={form.closingTime} onChange={e=>setForm({...form,closingTime:e.target.value})}/></div>
 <div className="col-md-6"><label>UPI ID <small>(optional)</small></label><input className="form-control" placeholder="yourname@upi" value={form.upiId} onChange={e=>setForm({...form,upiId:e.target.value})}/></div>
 <div className="col-md-6"><label>Shop Logo / Photo</label><input type="file" accept="image/*" className="form-control" onChange={e=>setLogo(e.target.files[0])}/></div>
 <div className="col-md-6"><label>UPI QR Image <small>(optional)</small></label><input type="file" accept="image/*" className="form-control" onChange={e=>setUpiQr(e.target.files[0])}/></div>
 </div><button className="btn btn-primary mt-4" disabled={saving}>{saving?"Saving...":shop?"Save Changes":"Create My Shop"}</button></form>
 {shop?.slug&&<div className="card border-0 shadow-sm p-4 mt-4"><h5>🎉 Your shop is live</h5><p className="text-secondary mb-2">Share this link or generate your QR from the dashboard.</p><code>{url}</code><div className="d-flex gap-2 mt-3"><button className="btn btn-outline-dark" onClick={()=>navigator.clipboard.writeText(url)}>Copy Link</button><a className="btn btn-success" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent("Visit my shop online: "+url)}`}>Share on WhatsApp</a><button className="btn btn-primary" onClick={()=>nav("/dashboard")}>Go to Dashboard</button></div></div>}
 </main>
}
