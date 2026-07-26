// ========== 1. FIREBASE CONFIG ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCX7fx7XvW6duavBYrTrzysIQN5gPyfJGo",
  authDomain: "willwin-cart.firebaseapp.com", 
  projectId: "willwin-cart",
  storageBucket: "willwin-cart.firebasestorage.app",
  messagingSenderId: "432614337343",
  appId: "1:432614337343:web:336c27edc1dd734d7c418a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ========== 2. LOAD PRODUCTS - SINGLE FUNCTION ==========
async function loadProducts() {
  const grid = document.getElementById('productGrid');
  if(!grid) return; // not on products page

  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  const categoryQuery = urlParams.get('category');
  const districtEl = document.getElementById("districtFilter");
  const priceEl = document.getElementById("priceFilter");
  
  const district = districtEl ? districtEl.value : null;
  const priceRange = priceEl ? priceEl.value : null;
  
  const resultTitle = document.getElementById("resultTitle");
  const resultCount = document.getElementById("resultCount");
  
  if(resultTitle) {
    if(searchQuery) resultTitle.innerText = `Results for "${searchQuery}"`;
    else if(categoryQuery) resultTitle.innerText = categoryQuery;
    else resultTitle.innerText = "All Products";
  }
  
  grid.innerHTML = '<p>Loading...</p>';
  
  try {
    const snapshot = await getDocs(collection(db, "products"));
    let products = [];
    
    snapshot.forEach((doc) => {
      let p = doc.data();
      p.id = doc.id;
      
      if(!p.name || !p.price || !p.image) return; // skip broken products
      
      let match = true;
      if(searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) match = false;
      if(categoryQuery && p.category !== categoryQuery) match = false;
      if(district && p.district !== district) match = false;
      if(priceRange){
        let [min, max] = priceRange.split("-").map(Number);
        if(Number(p.price) < min || Number(p.price) > max) match = false;
      }
      
      if(match) products.push(p);
    });
    
    if(resultCount) resultCount.innerText = `${products.length} Products Found`;
    
    if(products.length === 0){
      grid.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>No products found</p>";
      return;
    }
    
    grid.innerHTML = products.map(p => `
      <div class="product-card" onclick="location.href='product.html?id=${p.id}'">
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="price">₹${p.price} <span class="oldPrice">₹${p.oldPrice || ''}</span></p>
        <p class="discount">${p.discount || 0}% off</p>
        <p class="district">📍 ${p.district}</p>
      </div>
    `).join('');
    
  } catch(error) {
    console.error("Firebase Error:", error);
    grid.innerHTML = "<p style='color:red; text-align:center;'>Error loading products. Check Firebase rules.</p>";
  }
}

// ========== 3. TRENDING KOZHIKODE ==========
async function loadTrendingKozhikode() {
  const grid = document.getElementById('trendingKozhikode');
  if(!grid) return;

  let qSnap = await getDocs(collection(db, "products"));
  let products = qSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));
  let trending = products.filter(p => p.district === "Kozhikode").slice(0,8);

  grid.innerHTML = trending.map(p => `
    <div class="product-card" onclick="location.href='customer/product.html?id=${p.id}'">
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="price">₹${p.price}</p>
    </div>
  `).join('');
}

// ========== 4. SEARCH + FILTERS ==========
document.getElementById('searchBtn')?.addEventListener('click', () => {
  const val = document.getElementById('searchInput').value.trim();
  if(val) location.href = `customer/products.html?search=${encodeURIComponent(val)}`;
});

document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
  if(e.key === 'Enter') document.getElementById('searchBtn').click();
});

document.getElementById('districtFilter')?.addEventListener('change', loadProducts);
document.getElementById('priceFilter')?.addEventListener('change', loadProducts);

// ========== 5. INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadTrendingKozhikode();

  onAuthStateChanged(auth, (user) => {
    const authLink = document.getElementById('authLink');
    if(user && authLink) {
      authLink.innerText = 'Logout';
      authLink.onclick = (e) => { e.preventDefault(); signOut(auth); location.reload(); }
    }
  });
});
