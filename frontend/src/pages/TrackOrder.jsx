import {useEffect,useState} from "react";
import {useParams,Link} from "react-router-dom";
import api from "../api";
import StatusBadge from "../components/StatusBadge";
export default function TrackOrder(){
 const {id}=useParams(),[o,setO]=useState(null),[err,setErr]=useState("");
 useEffect(()=>{api.get(`/orders/track/${id}`).then(r=>setO(r.data)).catch(e=>setErr(e.response?.data?.message||"Order not found"))},[id]);
 if(err)return <main className="container py-5 text-center"><h2>{err}</h2><Link to="/">Back Home</Link></main>;
 if(!o)return <main className="container py-5 text-center">Loading order...</main>;
 return <main className="container py-5"><div className="track-card mx-auto card border-0 shadow-sm p-4"><div className="d-flex justify-content-between"><div><span className="eyebrow">ORDER TRACKING</span><h2>Order #{o.id}</h2><p className="text-secondary">{o.shop_name}</p></div><StatusBadge status={o.status}/></div><div className="status-flow my-4">{["NEW","ACCEPTED","PREPARING","READY","DELIVERED"].map((s,i)=><div className={["NEW","ACCEPTED","PREPARING","READY","DELIVERED"].indexOf(o.status)>=i?"active":""} key={s}><span>{i+1}</span><small>{s}</small></div>)}</div><hr/><h5>Items</h5>{o.items.map(x=><div className="d-flex justify-content-between py-2" key={x.id}><span>{x.product_name} × {x.quantity}</span><b>₹{Number(x.subtotal).toFixed(2)}</b></div>)}<div className="d-flex justify-content-between border-top pt-3 mt-2"><b>Total</b><b>₹{Number(o.total).toFixed(2)}</b></div><p className="small text-secondary mt-3 mb-0">Payment: {o.payment_method} / {o.payment_status}</p></div></main>
}
