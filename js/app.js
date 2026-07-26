import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1. PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = { 
  apiKey: "AIzaSyCX7fx7XvW6duavBYrTrzysIQN5gPyfJGo",
  authDomain: "willwin-cart.firebaseapp.com",
  projectId: "willwin-cart",
}; 
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// SEARCH FUNCTION - works from any page
const searchBtn = document.querySelector("#searchBtn");
const searchInput = document.querySelector("#searchInput");

function doSearch() {
  let query = searchInput.value.trim();
  if(query !== ""){
    // Check if we are already in customer folder
    let path = window.location.pathname.includes("/customer/") 
      ? `products.html?search=${query}` 
      : `customer/products.html?search=${query}`;
    
    window.location.href = path;
  }
}

if(searchBtn){ 
  searchBtn.addEventListener("click", doSearch); 
  console.log("Search button connected"); // for debugging
}
if(searchInput){ 
  searchInput.addEventListener("keypress", (e) => { 
    if (e.key === "Enter") doSearch(); 
  }); 
}
// 3. LOAD PRODUCTS ON PRODUCTS PAGE
const productGrid = document.getElementById("productGrid");
const resultTitle = document.getElementById("resultTitle");
const resultCount = document.getElementById("resultCount");

if(productGrid){
  loadProducts();
  
  // Add filter listeners
  document.getElementById("districtFilter").addEventListener("change", loadProducts);
  document.getElementById("priceFilter").addEventListener("change", loadProducts);
}

async function loadProducts() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  const categoryQuery = urlParams.get('category');
  const district = document.getElementById("districtFilter").value;
  const priceRange = document.getElementById("priceFilter").value;
  
  // Update title
  if(searchQuery) resultTitle.innerText = `Results for "${searchQuery}"`;
  if(categoryQuery) resultTitle.innerText = categoryQuery;
  
  const snapshot = await getDocs(collection(db, "products"));
  let products = [];
  
  snapshot.forEach((doc) => {
    let p = doc.data();
    p.id = doc.id;
    
    // FILTER LOGIC
    let match = true;
    if(searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) match = false;
    if(categoryQuery && p.category !== categoryQuery) match = false;
    if(district && p.district !== district) match = false;
    if(priceRange){
      let [min, max] = priceRange.split("-");
      if(p.price < min || p.price > max) match = false;
    }
    
    if(match) products.push(p);
  });
  
  resultCount.innerText = `${products.length} Products Found`;
  
  productGrid.innerHTML = "";
  if(products.length === 0){
    productGrid.innerHTML = "<p>No products found</p>";
    return;
  }
  
  products.forEach((p) => {
    productGrid.innerHTML += `
      <div class="product-card" onclick="location.href='product-detail.html?id=${p.id}'">
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="price">₹${p.price}</p>
        <p class="district">📍 ${p.district}</p>
      </div>
    `;
  });
}

console.log("Shopline JS Loaded");
