import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1. PASTE YOUR FIREBASE CONFIG
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

let allProducts = [];

// 2. LOAD ALL PRODUCTS FROM FIRESTORE
async function loadProducts() {
  const snap = await getDocs(collection(db, "products"));
  allProducts = [];
  const categories = new Set();
  const subcategories = new Set();
  const districts = new Set();

  snap.forEach(doc => {
    const p = doc.data();
    p.id = doc.id;
    allProducts.push(p);
    categories.add(p.category);
    subcategories.add(p.subcategory);
    districts.add(p.district);
  });

  fillDropdown('categoryFilter', categories);
  fillDropdown('subcategoryFilter', subcategories);
  fillDropdown('districtFilter', districts);
  
  // Show products in Flash Sale section first
  displayProducts(allProducts.slice(0,8), '.flash-sale .product-grid-4');
}

function fillDropdown(id, items) {
  const select = document.getElementById(id);
  items.forEach(item => {
    if(item){
      const opt = document.createElement('option');
      opt.value = item;
      opt.innerText = item;
      select.appendChild(opt);
    }
  });
}

// 3. FUNCTION TO SHOW PRODUCTS AS CARDS
function displayProducts(products, containerSelector) {
  const container = document.querySelector(containerSelector);
  if(!container) return;
  container.innerHTML = '';
  
  products.forEach(p => {
    const card = `
      <div class="product-card">
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="price">₹${p.price.toLocaleString()} <span class="oldPrice">₹${p.oldPrice.toLocaleString()}</span></p>
        <p class="discount">${p.discount}% off</p>
        <p>📍 ${p.district}</p>
        <button onclick="addToCart('${p.id}')" style="margin-top:5px;padding:8px;width:100%;background:#2874f0;color:#fff;border:none;cursor:pointer">Add to Cart</button>
      </div>
    `;
    container.innerHTML += card;
  });
}

// 4. FILTER LOGIC
['districtFilter','categoryFilter','subcategoryFilter','priceFilter'].forEach(id => {
  document.getElementById(id).addEventListener('change', applyFilters);
});

function applyFilters() {
  let filtered = allProducts;
  const district = districtFilter.value;
  const category = categoryFilter.value;
  const subcategory = subcategoryFilter.value;
  const price = priceFilter.value;

  if(district != 'all') filtered = filtered.filter(p => p.district == district);
  if(category != 'all') filtered = filtered.filter(p => p.category == category);
  if(subcategory != 'all') filtered = filtered.filter(p => p.subcategory == subcategory);
  
  if(price != 'all') {
    if(price == '0-1000') filtered = filtered.filter(p => p.price <= 1000);
    if(price == '1000-5000') filtered = filtered.filter(p => p.price > 1000 && p.price <= 5000);
    if(price == '5000+') filtered = filtered.filter(p => p.price > 5000);
  }
  displayProducts(filtered, '.flash-sale .product-grid-4');
}

// 5. ADD TO CART - SIMPLE VERSION
window.addToCart = function(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Added to Cart!');
}

loadProducts();
