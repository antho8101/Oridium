// orid-pricing.js

// Valeur actuelle fictive en dollars (modifiable plus tard)
let currentOridValueUSD = 150;

export function getOridPriceUSD() {
  return currentOridValueUSD;
}

export function setOridPriceUSD(newValue) {
  currentOridValueUSD = newValue;
  updateOridUSDDisplay();
}

// 🔄 Rafraîchit affichage USD total + prix unitaire
export function updateOridUSDDisplay() {
    // ✅ Toujours afficher la valeur unitaire
    const priceEl = document.querySelector(".orid-price-usd");
    if (priceEl) priceEl.textContent = `$${currentOridValueUSD.toLocaleString()}`;
  
    // ❌ Ne fait le calcul total que si wallet connecté
    const address = window.walletAddress;
    if (!address || typeof window.getWalletBalance !== "function") return;
  
    const balance = window.getWalletBalance(address);
    const usdValue = balance * currentOridValueUSD;
  
    const usdEl = document.querySelector(".orid-value-usd");
    if (usdEl) usdEl.textContent = `$${usdValue.toLocaleString()}`;
  }  

// 🔁 Appel initial dès que DOM est prêt
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    updateOridUSDDisplay(); // 🧠 le timeout garantit que le DOM est vraiment prêt
  }, 100);
});

// ✅ Exposition pour la console debug
window.setOridPriceUSD = setOridPriceUSD;
window.getOridPriceUSD = getOridPriceUSD;

// Appel initial pour afficher dès le départ
document.addEventListener("orid-wallet-connected", () => {
    updateOridUSDDisplay();
  });  