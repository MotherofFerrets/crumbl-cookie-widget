import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDbXrDxt2aT27nUvL6bI5FLrW8BT8Zqy8w",
  authDomain: "dashboard-e1556.firebaseapp.com",
  projectId: "dashboard-e1556",
  storageBucket: "dashboard-e1556.firebasestorage.app",
  messagingSenderId: "15479695262",
  appId: "1:15479695262:web:0a0999ed7a8fe0a161588f",
  measurementId: "G-NDD94ZZT10"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
