async function fetchOridPrice() {
    try {
      const res = await fetch("https://api.getoridium.com/api/price");
      const data = await res.json();
      return data.price;
    } catch (err) {
      console.warn("❌ Failed to fetch ORID price:", err);
      return null;
    }
  }
  
  function updateMarketPrice(price) {
    const el = document.querySelector(".market-price-main-value");
    if (el) el.textContent = price.toFixed(2);
  }
  
  document.addEventListener("DOMContentLoaded", async () => {
    const price = await fetchOridPrice();
    if (price !== null) updateMarketPrice(price);
  });  