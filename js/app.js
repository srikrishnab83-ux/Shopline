import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// 1. YOUR FIREBASE CONFIG - PASTE YOURS HERE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 2. INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 3. LOGIN/LOGOUT BUTTON LOGIC
const authLink = document.getElementById("authLink");
onAuthStateChanged(auth, (user) => {
  if (user) {
    authLink.innerText = "Logout";
    authLink.onclick = (e) => { e.preventDefault(); signOut(auth); location.reload(); };
  } else {
    authLink.innerText = "Login";
    authLink.href = "customer/auth.html";
  }
});

// 4. SEARCH FUNCTION - THIS FIXES YOUR 🔍 BUTTON
const searchInput = document.querySelector(".search-wrap input");
const searchBtn = document.querySelector(".search-wrap button");

function doSearch() {
  const searchTerm = searchInput.value.trim();
  if (searchTerm !== "") {
    // Go to products page with search query
    window.location.href = `customer/products.html?search=${encodeURIComponent(searchTerm)}`;
  }
}

// Click search button
searchBtn.addEventListener("click", doSearch);

// Press Enter key
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    doSearch();
  }
});

console.log("Shopline JS Loaded");
// 5. LOAD PRODUCTS ON PRODUCTS PAGE
const productGrid = document.getElementById("productGrid");
if(productGrid){
  loadProducts();
}

async function loadProducts() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  const district = urlParams.get('district');

  document.getElementById("searchInput").value = searchQuery || "";
  if(searchQuery) document.getElementById("resultTitle").innerText = `Results for "${searchQuery}"`;

  let q = collection(db, "products");
  // Note: For now we get all products. Later we add where() for search/district
  const querySnapshot = await getDocs(q);
  
  productGrid.innerHTML = "";
  let count = 0;
  
  querySnapshot.forEach((doc) => {
    const product = doc.data();
    // Simple client-side search filter
    if(searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return;
    
    count++;
    productGrid.innerHTML += `
      <div class="product-card" onclick="location.href='product-detail.html?id=${doc.id}'">
        <img src="${product.image}">
        <h3>${product.name}</h3>
        <p class="price">₹${product.price} <span class="oldPrice">₹${product.oldPrice}</span></p>
        <p class="discount">${product.discount}% off</p>
        <p style="font-size:11px; color:#878787;">Seller: ${product.district}</p>
      </div>
    `;
  });
  
  document.getElementById("resultCount").innerText = `${count} Products Found`;
}
