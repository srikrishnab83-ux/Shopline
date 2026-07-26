import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1. YOUR FIREBASE CONFIG
const firebaseConfig = { 
  apiKey: "AIzaSyCX7fx7XvW6duavBYrTrzysIQN5gPyfJGo",
  authDomain: "willwin-cart.firebaseapp.com",
  projectId: "willwin-cart",
}; 
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. SEARCH FUNCTION
const searchBtn = document.querySelector("#searchBtn");
const searchInput = document.querySelector("#searchInput");

function doSearch() {
  let query = searchInput.value.trim();
  if(query !== ""){
    let path = window.location.pathname.includes("/customer/") 
      ? `products.html?search=${encodeURIComponent(query)}` 
      : `customer/products.html?search=${encodeURIComponent(query)}`;
    window.location.href = path;
  }
}

if(searchBtn){ 
  searchBtn.addEventListener("click", doSearch); 
}
if(searchInput){ 
  searchInput.addEventListener("keypress", (e) => { 
    if (e.key === "Enter") doSearch(); 
  }); 
}

// 3. LOAD PRODUCTS ON PRODUCTS PAGE
const productGrid = document.getElementById("productGrid");

if(productGrid){
  loadProducts();
  
  document.getElementById("districtFilter")?.addEventListener("change", loadProducts);
  document.getElementById("priceFilter")?.addEventListener("change", loadProducts);
}

async function loadProducts() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  const categoryQuery = urlParams.get('category');
  const district = document.getElementById("districtFilter").value;
  const priceRange = document.getElementById("priceFilter").value;
  
  const resultTitle = document.getElementById("resultTitle");
  const resultCount = document.getElementById("resultCount");
  
  if(searchQuery) resultTitle.innerText = `Results for "${searchQuery}"`;
  if(categoryQuery) resultTitle.innerText = categoryQuery;
  if(!searchQuery && !categoryQuery) resultTitle.innerText = "All Products";
  
  try {
    const snapshot = await getDocs(collection(db, "products"));
    let products = [];
    
    snapshot.forEach((doc) => {
      let p = doc.data();
      p.id = doc.id;
      
      let match = true;
      if(searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) match = false;
      if(categoryQuery && p.category !== categoryQuery) match = false;
      if(district && p.district !== district) match = false;
      if(priceRange){
        let [min, max] = priceRange.split("-").map(Number); // FIX: convert to number
        if(Number(p.price) < min || Number(p.price) > max) match = false;
      }
      
      if(match) products.push(p);
    });
    
    resultCount.innerText = `${products.length} Products Found`;
    productGrid.innerHTML = "";
    
    if(products.length === 0){
      productGrid.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>No products found. Add products in Firebase first.</p>";
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
    
  } catch(error) {
    console.error("Firebase Error:", error);
    productGrid.innerHTML = "<p style='color:red;'>Error loading products. Check Firebase rules.</p>";
  }
}

console.log("Shopline JS Loaded");
