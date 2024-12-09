
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey:  process.env.REACT_APP_FB_API_KEY,
  authDomain: "zoeappstore-56eb5.firebaseapp.com",
  projectId: "zoeappstore-56eb5",
  storageBucket: "zoeappstore-56eb5.appspot.com",
  messagingSenderId: "616249728664",
  appId: "1:616249728664:web:276457414ab01701113aed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);