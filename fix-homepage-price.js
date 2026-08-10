
// fix-homepage-price.js - Include this in index.html before </body>
// <script src="fix-homepage-price.js"></script>
(function(){
  function getSale(p){ return p.sellingPrice||p.salePrice||p.price||p.sale_rate||p.saleRate||p.finalPrice||p.final_price||p.displayPrice||p.customerPays||p.selling_price||0; }
  function getMrp(p){ return p.oldMrpPrice||p.mrp||p.oldPrice||p.MRP||p.mrpPrice||p.originalPrice||p.strikedPrice||0; }
  
  // Wait for products to load then fix DOM
  function fixDOM(){
    document.querySelectorAll('[id^="product"], .product-card, .latest-product').forEach(card=>{
      // Try to find price text with undefined
      const html = card.innerHTML;
      if(html.includes('undefined') || html.includes('NaN')){
        // Try to get product data from card's data attribute or global
        // This will be replaced by direct Firestore fetch below
      }
    });
  }

  // Better: Re-fetch products and fix display
  async function refetchAndFix(){
    try{
      if(typeof firebase==='undefined') return;
      const db = firebase.firestore();
      const snap = await db.collection('products').limit(20).get();
      const products = {};
      snap.forEach(doc=>{ products[doc.id]=doc.data(); });
      
      // Fix all cards that have undefined
      document.querySelectorAll('.product-card, [class*="product"]').forEach((card, idx)=>{
        const titleEl = card.querySelector('h3, h4, .title, [class*="name"]');
        if(!titleEl) return;
        const title = titleEl.textContent.trim().toLowerCase();
        // Find matching product by name
        for(let id in products){
          let p = products[id];
          let pName = (p.productName||p.name||'').toLowerCase();
          if(pName && (title.includes(pName.substring(0,10)) || pName.includes(title.substring(0,10)))){
            let sale = getSale(p);
            let mrp = getMrp(p);
            let disc = mrp>sale?Math.round(((mrp-sale)/mrp)*100):0;
            // Replace undefined in card
            card.innerHTML = card.innerHTML.replace(/₹undefined/g, `₹${sale}`).replace(/NaN% off/g, `${disc}% off`);
            break;
          }
        }
      });
    }catch(e){ console.log('fix error', e); }
  }
  
  setTimeout(refetchAndFix, 2000);
  setTimeout(refetchAndFix, 4000);
  setTimeout(refetchAndFix, 6000);
})();
