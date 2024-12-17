// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const path = require("path");
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8')
);


//console.log("Service Account Key:", serviceAccount);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = { admin, db };

// CORS Configuration
const allowedOrigins = [
  "https://zoestore.vercel.app", // Add your frontend origin
  "http://localhost:4243",
          // For local development
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // If using cookies or authorization headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"],    // Allowed headers
  })
);

// Handle preflight requests
app.options("*", cors());
// Body Parser Middleware
app.use(express.json());



// Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the Zoestore website.");
});

// Create Payment Intent
app.post("/create-payment-intent", async (req, res) => {
  const { items, email, shipping, description } = req.body;
  if (!items || !email || !shipping) {
    return res.status(400).send({ error: "Missing required fields" });
  }
  const totalAmount = calculateOrderAmount(items);

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: totalAmount,
        currency: "NGN",
        callback_url: `${process.env.FRONTEND_URL}/Payment-success`, // Updated Callback URL
        description,
        metadata: {
          custom_fields: [
            {
              display_name: shipping.name,
              variable_name: shipping.phone,
              value: `${shipping.line1}, ${shipping.city}, ${shipping.country}`,
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Paystack verification response:", response.data);

    res.send({
      authorizationUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,  // Paystack reference
      
    });
    console.log("Generated reference:", response.data.data.reference);
  } catch (error) {
    //console.error("Error initializing payment:", error.response?.data || error.message);
    res.status(500).send({
      message: "Payment initialization failed. Please try again.",
      error: error.response?.data || error.message,
    });
  }
  
});

// Verify Payment
app.post("/verify-payment/:reference", async (req, res) => {
  const { reference } = req.params;

  try {
    // Verify payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    console.log("Paystack verification response:", response.data);

    if (response.data.data.status === "success") {
      // Prepare order object
      const order = {
        userID: req.body.userID || "Unknown User",
        userEmail: req.body.email || "No Email",
        orderDate: new Date().toDateString(),
        orderTime: new Date().toLocaleTimeString(),
        orderAmount: req.body.amount || 0,
        orderStatus: "Order Placed...",
        cartItems: req.body.items || [],
        shippingAddress: req.body.shipping || {},
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (!order.userID || !order.userEmail || !order.cartItems.length) {
        return res.status(400).json({ message: "Invalid order details" });
      }

      // Save order in Firestore
      const orderRef = await db.collection("orders").add(order);
      console.log("Order saved to Firebase:", orderRef.id);

      return res.json({ status: "success", orderId: orderRef.id });
    }

    return res.status(400).json({ status: "failed", message: "Payment not successful" });
  } catch (error) {
    console.error("Error during payment verification:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      stack: error.stack,
    });

    res.status(500).json({
      message: "Payment verification failed",
      error: error.response?.data || error.message,
    });
  }
});
//console.log("Paystack Secret Key:", process.env.PAYSTACK_SECRET_KEY);


// Calculate Order Amount
const calculateOrderAmount = (items) => {
  const total = items.reduce((acc, item) => acc + item.price * item.cartQuantity, 0);
  return total * 100; // Convert to Kobo
};
// Serve Static Files in Production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "build", "index.html"));
  });
}

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
