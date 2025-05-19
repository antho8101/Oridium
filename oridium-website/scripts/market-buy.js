// scripts/market-buy.js

let currentPrice = null;
let currentStock = null;

async function fetchPriceAndStock() {
  try {
    const [priceRes, stockRes] = await Promise.all([
      fetch("https://api.getoridium.com/api/price"),
      fetch("https://api.getoridium.com/api/stock")
    ]);

    const priceData = await priceRes.json();
    const stockData = await stockRes.json();

    currentPrice = parseFloat(priceData.price);
    currentStock = parseFloat(stockData.available);
    const maxQuota = parseFloat(stockData.maxWeeklyQuota);

    updatePriceDisplay(currentPrice);
    updateStockUI(currentStock, maxQuota);
  } catch (err) {
    console.error("❌ Failed to fetch price or stock:", err);
  }
}

function updatePriceDisplay(price) {
  const el = document.querySelector(".market-price-value");
  if (el) el.textContent = `1.0000 ORID = $${price.toFixed(2)}`;
}

function updateStockUI(available, maxQuota) {
  const maxLabel = document.querySelector(".market-progress-max");
  const fill = document.querySelector(".market-progress-fill");
  const alert = document.querySelector(".market-alert-text");

  if (maxLabel) maxLabel.textContent = `${maxQuota.toFixed(4)} ORID`;

  if (fill) {
    const percent = (available / maxQuota) * 100;
    fill.style.width = `${percent}%`;
  }

  if (alert) {
    if (available / maxQuota <= 0.1) {
      alert.textContent = `Only ${available.toFixed(4)} ORID left this week – price may rise soon`;
    } else {
      alert.textContent = `${available.toFixed(4)} ORID available this week`;
    }
  }
}

function updateTotalPriceDisplay(amount) {
  const total = amount * currentPrice;
  const totalEl = document.querySelector(".market-total-value");
  if (totalEl) {
    totalEl.textContent = `$${total.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}

function setupMaxButton() {
  const maxBtn = document.querySelector(".market-buy-max");
  if (!maxBtn || !currentStock) return;

  maxBtn.addEventListener("click", () => {
    const input = document.querySelector(".market-buy-input");
    if (!input) return;

    input.value = `${currentStock.toFixed(4)} ORID`;
    updateTotalPriceDisplay(currentStock);
  });
}

function setupInputListener() {
  const input = document.querySelector(".market-buy-input");
  if (!input) return;

  input.addEventListener("input", () => {
    const val = input.value.replace(/[^\d.]/g, '');
    const amount = parseFloat(val);
    if (!isNaN(amount)) {
      updateTotalPriceDisplay(amount);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchPriceAndStock();
  setupMaxButton();
  setupInputListener();
});