// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAECphbs9dY_wOPImFp039hvno6slNCM7o",
  authDomain: "calorietracker-9be2e.firebaseapp.com",
  projectId: "calorietracker-9be2e",
  storageBucket: "calorietracker-9be2e.firebasestorage.app",
  messagingSenderId: "715036611581",
  appId: "1:715036611581:web:4449c13a0bcf7690efbf94",
  measurementId: "G-PR0JL6T7S6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);