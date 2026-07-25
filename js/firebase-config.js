import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase Configuration

const firebaseConfig = {

  apiKey: "AIzaSyCX7fx7XvW6duavBYrTrzysIQN5gPyfJGo",

  authDomain: "willwin-cart.firebaseapp.com",

  databaseURL: "https://willwin-cart-default-rtdb.firebaseio.com",

  projectId: "willwin-cart",

  storageBucket: "willwin-cart.firebasestorage.app",

  messagingSenderId: "432614337343",

  appId: "1:432614337343:web:336c27edc1dd734d7c418a",

  measurementId: "G-8WD54NWJW5"

};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const auth = getAuth(app);

const db = getFirestore(app);

