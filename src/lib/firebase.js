import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAECphbs9dY_wOPImFp039hvno6slNCM7o",
    authDomain: "calorietracker-9be2e.firebaseapp.com",
    projectId: "calorietracker-9be2e",
    storageBucket: "calorietracker-9be2e.firebasestorage.app",
    messagingSenderId: "715036611581",
    appId: "1:715036611581:web:4449c13a0bcf7690efbf94",
    measurementId: "G-PR0JL6T7S6"
  };
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
