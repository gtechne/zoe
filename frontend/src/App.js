import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {Home, Contact,Login,Register, Reset, Admin} from "./pages/index"
import {Header, Footer } from "./components/index"
import AdminOnlyRoute from "./components/adminOnlyRoute/AdminOnlyRoute";
import ProductDetails from "./components/product/productDetails/ProductDetails";
import Cart from "./pages/cart/Cart";









import OrderHistory from "./pages/orderHistory/OrderHistory";
import OrderDetails from "./pages/orderDetails/OrderDetails";
import ReviewProducts from "./components/reviewProducts/ReviewProducts";
import NotFound from "./pages/notFound/NotFound";
import PayStackDetails from "./pages/paystack/PayStackDetails";
import Paystack from "./pages/paystack/Paystack";
import PaymentSuccess from "./pages/paystack/PaymentSuccess";

function App() {
  return (
    <>
     <BrowserRouter>
     <ToastContainer />
       <Header/>
       <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/reset" element={<Reset/>}/>

        <Route
            path="/admin/*"
            element={
              <AdminOnlyRoute>
                <Admin />
              </AdminOnlyRoute>
            }
          />


          <Route path="/product-details/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          
          <Route path="/paystack-Details" element={<PayStackDetails />} />
         
          
          <Route path="/Paystack" element={<Paystack />} />
          
         
          
          <Route path="/Payment-success" element={<PaymentSuccess />} />
          
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/order-details/:id" element={<OrderDetails />} />
          <Route path="/review-product/:id" element={<ReviewProducts />} />
          <Route path="*" element={<NotFound />} />
        
       </Routes>
       <Footer/>

     </BrowserRouter>
    </>
  );
}

export default App;
