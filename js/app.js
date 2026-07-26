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
