import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ShopSetup from "./pages/ShopSetup";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import PublicShop from "./pages/PublicShop";
import TrackOrder from "./pages/TrackOrder";

function Private({children}) {
  return localStorage.getItem("digitalvendor_token") ? children : <Navigate to="/login" replace />;
}

export default function App(){
  return <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/dashboard" element={<Private><Dashboard/></Private>}/>
      <Route path="/shop-setup" element={<Private><ShopSetup/></Private>}/>
      <Route path="/products" element={<Private><Products/></Private>}/>
      <Route path="/orders" element={<Private><Orders/></Private>}/>
      <Route path="/shop/:slug" element={<PublicShop/>}/>
      <Route path="/track/:id" element={<TrackOrder/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  </BrowserRouter>;
}
