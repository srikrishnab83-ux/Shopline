// ========== 1. FIREBASE CONFIG ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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

// ========== 2. GLOBAL VARS ==========
let allProducts = [];

// ========== 3. LOAD PRODUCTS FUNCTION ==========
async function loadProducts(category = null, district = null, search = null) {
  const grid = document.getElementById('productGrid');
  if(!grid) return;
  
  grid.innerHTML = '<p>Loading...</p>';
  
  let q = collection(db, "products");
  let qSnap = await getDocs(q);
  allProducts = qSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));

  let filtered = allProducts;

  if(category) filtered = filtered.filter(p => p.category === category);
  if(district) filtered = filtered.filter(p => p.district === district);
  if(search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  document.getElementById('resultCount').innerText = `${filtered.length} products found`;

  if(filtered.length === 0) {
    grid.innerHTML = '<p>No products found</p>';
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card" onclick="location.href='product.html?id=${p.id}'">
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="price">₹${p.price} <span class="oldPrice">₹${p.oldPrice}</span></p>
      <p class="discount">${p.discount}% off</p>
      <p class="district">📍 ${p.district}</p>
    </div>
  `).join('');
}

// ========== 4. TRENDING KOZHIKODE FOR HOMEPAGE ==========
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
      <p class="price">₹${p.price} <span class="oldPrice">₹${p.oldPrice}</span></p>
      <p class="discount">${p.discount}% off</p>
    </div>
  `).join('');
}

// ========== 5. SEARCH FUNCTION ==========
document.getElementById('searchBtn')?.addEventListener('click', () => {
  const val = document.getElementById('searchInput').value.trim();
  if(val) location.href = `customer/products.html?search=${encodeURIComponent(val)}`;
});

document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
  if(e.key === 'Enter') document.getElementById('searchBtn').click();
});

// ========== 6. FLASH SALE TIMER ==========
function startTimer(duration) {
  let timer = duration, hours, minutes, seconds;
  setInterval(function () {
    hours = parseInt(timer / 3600, 10);
    minutes = parseInt((timer % 3600) / 60, 10);
    seconds = parseInt(timer % 60, 10);
    document.getElementById('timer').textContent = 
      `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
    if (--timer < 0) timer = duration;
  }, 1000);
}

// ========== 7. INIT ON PAGE LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  const district = params.get('district');
  const search = params.get('search');
  
  loadProducts(category, district, search);
  loadTrendingKozhikode();
  startTimer(6 * 60 * 60); // 6 hours

  // Auth Link
  onAuthStateChanged(auth, (user) => {
    const authLink = document.getElementById('authLink');
    if(user && authLink) {
      authLink.innerText = 'Logout';
      authLink.onclick = (e) => { e.preventDefault(); signOut(auth); location.reload(); }
    }
  });
});
async function loadProducts() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  const categoryQuery = urlParams.get('category');
  const district = document.getElementById("districtFilter").value;
  const priceRange = document.getElementById("priceFilter").value;
  
  const resultTitle = document.getElementById("resultTitle");
  const resultCount = document.getElementById("resultCount");
  
  if(searchQuery) resultTitle.innerText = `Results for "${searchQuery}"`;
  else if(categoryQuery) resultTitle.innerText = categoryQuery;
  else resultTitle.innerText = "All Products";
  
  try {
    const snapshot = await getDocs(collection(db, "products"));
    let products = [];
    
    snapshot.forEach((doc) => {
      let p = doc.data();
      p.id = doc.id;
      
      // Skip if required fields are missing
      if(!p.name || !p.price || !p.image) return; 
      
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
    
    resultCount.innerText = `${products.length} Products Found`;
    productGrid.innerHTML = "";
    
    if(products.length === 0){
      productGrid.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>No products found</p>";
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
    productGrid.innerHTML = "<p style='color:red; text-align:center;'>Error loading products. Check Firebase rules.</p>";
  }
}
