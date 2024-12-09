// src/services/orderService.js

import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { toast } from "react-toastify";

/**
 * Creates an order configuration object.
 *
 * @param {Object} params - Parameters for creating an order.
 * @param {string} params.userID - ID of the user placing the order.
 * @param {string} params.userEmail - Email of the user.
 * @param {number} params.cartTotalAmount - Total amount of the cart.
 * @param {Array} params.cartItems - Items in the cart.
 * @param {Object} params.shippingAddress - Shipping address details.
 * @returns {Object} - The order configuration object.
 */
export const createOrderConfig = ({
  userID,
  userEmail,
  cartTotalAmount,
  cartItems,
  shippingAddress,
}) => {
  const today = new Date();
  return {
    userID,
    userEmail,
    orderDate: today.toDateString(),
    orderTime: today.toLocaleTimeString(),
    orderAmount: cartTotalAmount,
    orderStatus: "Order Placed...",
    cartItems,
    shippingAddress,
    createdAt: Timestamp.now(),
  };
};

/**
 * Saves an order to the Firestore "orders" collection.
 *
 * @param {Object} orderData - The order details to be saved.
 * @returns {Promise<string>} - The ID of the saved order.
 */
export const saveOrderToFirestore = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, "orders"), orderData);
    console.log("Order successfully written with ID: ", docRef.id);
    toast.success("Order saved successfully!");
    return docRef.id;
  } catch (error) {
    console.error("Error saving order:", error);
    toast.error("Failed to save order. Please try again.");
    throw error; // Re-throw for further handling if necessary
  }
};
