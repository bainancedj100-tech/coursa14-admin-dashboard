import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxGwh9YkDXbQk5wo4JBIQJBJT1UEjQI90",
  authDomain: "coursa14.firebaseapp.com",
  projectId: "coursa14",
  storageBucket: "coursa14.firebasestorage.app",
  appId: "1:145158600486:web:YOUR_WEB_APP_ID" // Placeholder
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
