import React, { useEffect, useState } from "react";
import styles from "./CheckoutForm.module.scss";
import Card from "../card/Card";
import CheckoutSummary from "../checkoutSummary/CheckoutSummary";
import spinnerImg from "../../assets/spinner.jpg";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { selectEmail, selectUserID } from "../../redux/slice/authSlice";
import {
  CLEAR_CART,
  selectCartItems,
  selectCartTotalAmount,
} from "../../redux/slice/cartSlice";
import { selectShippingAddress } from "../../redux/slice/checkoutSlice";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const PayStackForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userID = useSelector(selectUserID);
  const userEmail = useSelector(selectEmail);
  const cartItems = useSelector(selectCartItems);
  const cartTotalAmount = useSelector(selectCartTotalAmount);
  const shippingAddress = useSelector(selectShippingAddress);

  // Backend base URL from environment variables
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL.replace(/\/$/, ""); // Remove trailing slash
 

  // Save order to Order History
  const saveOrder = async () => {
    const today = new Date();
    const date = today.toDateString();
    const time = today.toLocaleTimeString();
    const orderConfig = {
      userID,               // Ensure this is coming from your state or props
      userEmail,            // Ensure this is coming from your state or props
      orderDate: date,
      orderTime: time,
      orderAmount: cartTotalAmount, // Ensure this value is correct
      orderStatus: "Order Placed...",
      cartItems,            // Ensure this is coming from your state
      shippingAddress,      // Ensure this is coming from your state
      createdAt: Timestamp.now(), // Firestore Timestamp
    };
  
    try {
      // Save the order to the "orders" collection in Firestore
      const docRef = await addDoc(collection(db, "orders"), orderConfig);
      //console.log("Order successfully written with ID: ", docRef.id);
      dispatch(CLEAR_CART()); // Clear the cart after saving order
      toast.success("Order saved");
      navigate("/Payment-success");
    } catch (error) {
     // console.error("Error saving order:", error);
      toast.error("Error saving order: " + error.message);
    }
  };

  // Verify payment after redirection from Paystack
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const reference = query.get("reference");

    if (reference) {
      verifyPayment(reference);
    }
  }, [location.search]);

  const verifyPayment = async (reference) => {
    console.log("Verifying payment with reference:", reference); // Log the reference

    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/verify-payment/${reference}`, {
        userID,            // Ensure this is coming from your state or props
          email: userEmail,   // Ensure this is coming from your state or props
          items: cartItems,   // Ensure this is coming from your state
          shipping: shippingAddress,  // Ensure this is coming from your state
          amount: cartTotalAmount,   // Ensure this is coming from your state
       
      });
      navigate("/Payment-success");
      dispatch(CLEAR_CART()); // Clear the cart after saving order
      //console.log("Verification response:", response.data); // Log response data

     /* if (response.data.status === true) {
        toast.success("Payment successful");
        await saveOrder(response.data.orderId);
        navigate("/checkout-success");
      } else {
        toast.error("Payment failed");
      }*/
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Payment verification failed");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handlePaystackPayment = async () => {
    setIsLoading(true);

    try {
      // Initialize Paystack payment
      const response = await axios.post(
        `${BACKEND_URL}/create-payment-intent`,
        {
          items: cartItems,
          email: userEmail,
          shipping: shippingAddress,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { authorizationUrl, reference } = response.data;
      const paystackHandler = window.PaystackPop.setup({
        key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY, // Paystack public key
        email: userEmail,
        amount: cartTotalAmount * 100, // Convert to kobo
        ref: reference, // Reference generated from the backend
        currency: "NGN",
        callback: function (response) {
          // Payment complete, trigger verification
          verifyPayment(response.reference);
        },
        onClose: function () {
          toast.info("Payment window closed.");
          navigate("/cart");
          setIsLoading(false);
        },
      });

      paystackHandler.openIframe(); // Open the Paystack iframe inline
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error(
        error.response?.data?.message || "Payment initialization failed. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <section>
      <div className={`container ${styles.checkout}`}>
        
        <Card cardClass={styles.card}>
          <CheckoutSummary />
        </Card>

        <Card cardClass={`${styles.card} ${styles.pay}`}>
          <h3>Paystack Checkout</h3>
          <button
            disabled={isLoading}
            onClick={handlePaystackPayment}
            className={styles.button}
          >
            {isLoading ? (
              <img src={spinnerImg} alt="Loading..." style={{ width: "20px" }} />
            ) : (
              "Pay now"
            )}
          </button>
        </Card>
      </div>
    </section>
  );
};

export default PayStackForm;
