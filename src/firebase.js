import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxGwh9YkDXbQk5wo4JBIQJBJT1UEjQI90",
  projectId: "coursa14",
  storageBucket: "coursa14.firebasestorage.app",
  // Note: authDomain and appId might be required in the future for Auth,
  // but for Firestore REST/SDK, projectId and apiKey are usually sufficient.
  appId: "1:145158600486:web:YOUR_WEB_APP_ID" // Placeholder, user will replace if needed
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
