// scripts/orid-pricing.js

let currentOridValueUSD = 720;

export function getOridPriceUSD() {
  return currentOridValueUSD;
}

export function setOridPriceUSD(newValue) {
  currentOridValueUSD = newValue;
  updateOridUSDDisplay();
}

export function updateOridUSDDisplay() {
  const priceEl = document.querySelector(".orid-price-usd");
  if (priceEl) priceEl.textContent = `$${currentOridValueUSD.toFixed(2)}`;

  const address = window.walletAddress;
  if (address && typeof window.getWalletBalance === "function") {
    const balance = window.getWalletBalance(address);
    const usdValue = balance * currentOridValueUSD;

    const usdEl = document.querySelector(".orid-value-usd");
    if (usdEl) usdEl.textContent = `$${usdValue.toFixed(2)}`;
  }
}
// ✅ Réagit à la connexion wallet
document.addEventListener("orid-wallet-connected", () => {
  updateOridUSDDisplay();
});

// ✅ Init DOM une fois chargé
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(updateOridUSDDisplay, 200);
});

// ✅ Console debug
window.setOridPriceUSD = setOridPriceUSD;
window.getOridPriceUSD = getOridPriceUSD;