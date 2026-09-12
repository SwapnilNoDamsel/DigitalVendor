import {useEffect,useMemo,useState} from "react";
import {useLocation,useNavigate,useParams} from "react-router-dom";
import api,{BACKEND} from "../api";
export default function PublicShop(){
const {slug}=useParams(),nav=useNavigate(),location=useLocation();
const [data,setData]=useState(null),[search,setSearch]=useState(""),[cat,setCat]=useState("All"),[cart,setCart]=useState({});
 useEffect(()=>{api.get(`/shop/public/${slug}`).then(r=>setData(r.data)).catch(()=>setData({error:true}))},[slug]);
 const products=data?.products||[]; const cats=["All",...new Set(products.map(p=>p.category).filter(Boolean))];
 const visible=useMemo(()=>products.filter(p=>(cat==="All"||p.category===cat)&&p.name.toLowerCase().includes(search.toLowerCase())),[products,cat,search]);
 const cartItems=Object.entries(cart).map(([id,quantity])=>{const p=products.find(x=>x.id===Number(id));return p?{...p,quantity}:null}).filter(Boolean);
 const total=cartItems.reduce((s,p)=>s+Number(p.price)*p.quantity,0);
 if(!data)return <main className="container py-5 text-center">Loading shop...</main>;
 if(data.error)return <main className="container py-5 text-center"><h2>Shop not found</h2></main>;
 const shop=data.shop;
 const add=p=>setCart({...cart,[p.id]:Math.min(p.stock,(cart[p.id]||0)+1)});
 return <main className="pb-5"><section className="shop-cover"><div className="container py-5"><div className="shop-profile">{shop.logo_url?<img src={BACKEND+shop.logo_url}/>:<div className="shop-logo-fallback">{shop.shop_name[0]}</div>}<div><span className="eyebrow">{shop.category}</span><h1 className="fw-bold">{shop.shop_name}</h1><p className="mb-1">{shop.address}</p><small>Open {shop.opening_time?.slice(0,5)} – {shop.closing_time?.slice(0,5)}</small></div></div></div></section><div className="container mt-4"><div className="d-flex flex-wrap gap-2 mb-4"><input className="form-control search" placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)}/>{cats.map(c=><button key={c} className={`btn ${cat===c?"btn-primary":"btn-outline-secondary"}`} onClick={()=>setCat(c)}>{c}</button>)}</div><div className="row g-4">{visible.map(p=><div className="col-6 col-md-4 col-lg-3" key={p.id}><div className="card product-card h-100 border-0 shadow-sm">{p.image_url?<img src={BACKEND+p.image_url} className="public-product-img"/>:<div className="product-placeholder">No Image</div>}<div className="p-3"><span className="small text-secondary">{p.category}</span><h5 className="mt-1">{p.name}</h5><p className="small text-secondary">{p.description}</p><div className="d-flex justify-content-between align-items-center"><b>₹{Number(p.price).toFixed(2)}</b>{p.stock>0?<button className="btn btn-sm btn-primary" onClick={()=>add(p)}>Add</button>:<span className="badge bg-secondary">Unavailable</span>}</div><small className="text-secondary">{p.stock} available</small></div></div></div>)}</div>{!visible.length&&<div className="empty">No matching products found.</div>}</div>{cartItems.length>0&&<div className="cart-bar shadow-lg"><div><b>{cartItems.reduce((s,p)=>s+p.quantity,0)} items</b><span className="ms-3">₹{total.toFixed(2)}</span></div><button className="btn btn-primary" onClick={()=>nav(`/shop/${slug}?checkout=1`,{state:{cart:cartItems}})}>Checkout</button></div>}<Checkout shop={shop} cartItems={cartItems} total={total} clear={()=>setCart({})} location={location}/></main>
}

function Checkout({shop,cartItems,total,clear,location}){
 const [open,setOpen]=useState(false),[form,setForm]=useState({customerName:"",customerMobile:"",deliveryAddress:"",paymentMethod:"COD"}),[done,setDone]=useState(null),[err,setErr]=useState("");
 useEffect(() => {
  if (location.search.includes("checkout")) {
    setOpen(true);
  }
}, [location.search]);
 if(!open)return null;
 const place=async e=>{e.preventDefault();try{const r=await api.post("/orders",{shopId:shop.id,...form,items:cartItems.map(x=>({productId:x.id,quantity:x.quantity}))});setDone(r.data);clear()}catch(e){setErr(e.response?.data?.message||"Could not place order")}};
 return <div className="modal-backdrop-custom"><div className="checkout-modal">{done?<><h3>Order placed 🎉</h3><p>Your order number is <b>#{done.orderId}</b>.</p><p>Total: <b>₹{Number(done.total).toFixed(2)}</b></p><a className="btn btn-primary" href={`/track/${done.orderId}`}>Track Order</a></>:<><div className="d-flex justify-content-between"><h4>Checkout</h4><button className="btn-close" onClick={()=>setOpen(false)}/></div>{err&&<div className="alert alert-danger mt-3">{err}</div>}<form onSubmit={place}><label className="mt-3">Name</label><input className="form-control" required value={form.customerName} onChange={e=>setForm({...form,customerName:e.target.value})}/><label className="mt-3">Mobile</label><input className="form-control" required value={form.customerMobile} onChange={e=>setForm({...form,customerMobile:e.target.value})}/><label className="mt-3">Delivery Address</label><textarea className="form-control" required value={form.deliveryAddress} onChange={e=>setForm({...form,deliveryAddress:e.target.value})}/><label className="mt-3">Payment Method</label><select className="form-select" value={form.paymentMethod} onChange={e=>setForm({...form,paymentMethod:e.target.value})}><option value="COD">Cash on Delivery</option><option value="UPI">UPI (demo payment flow)</option></select><div className="mt-3 p-3 bg-light rounded"><b>Total ₹{total.toFixed(2)}</b></div><button className="btn btn-primary w-100 mt-3">Place Order</button></form></>}</div></div>
}
