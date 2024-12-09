import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CALCULATE_SUBTOTAL,
  CALCULATE_TOTAL_QUANTITY,
  selectCartItems,
  
} from "../../redux/slice/cartSlice";
import styles from "./CheckoutDetails.module.scss";

import PayStackForm from "../../components/payStackForm/PayStackForm";
import Card from "../../components/card/Card";

const Paystack = () => {
  const cartItems = useSelector(selectCartItems);
  
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(CALCULATE_SUBTOTAL());
    dispatch(CALCULATE_TOTAL_QUANTITY());
  }, [dispatch, cartItems]);

  return (
    <section>
      <div className={`container ${styles.checkout}`}>
      <Card cardClass={styles.card}>
      <h3>Checkout with Paystack</h3>
      <PayStackForm />
        </Card>
        
      </div>
    </section>
  );
};

export default Paystack;
