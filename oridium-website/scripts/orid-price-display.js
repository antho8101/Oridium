let lastPrice = null;

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

function updateMarketDisplay(price) {
  const priceEl = document.querySelector(".market-price-main-value");
  const changeEl = document.querySelector(".market-price-change");
  const iconEl = changeEl?.querySelector("img");

  if (!priceEl || !changeEl || !iconEl) return;

  priceEl.textContent = price.toFixed(2);

  if (lastPrice !== null) {
    const diff = price - lastPrice;
    const percent = ((diff / lastPrice) * 100).toFixed(2);
    const sign = diff >= 0 ? "+" : "";

    changeEl.textContent = `${sign}${diff.toFixed(2)} (${sign}${percent}%)`;
    iconEl.src = diff >= 0
      ? "assets/ri_arrow-right-up-long-line.svg"
      : "assets/ri_arrow-right-down-long-line.png";
    changeEl.appendChild(iconEl);

    changeEl.classList.remove("market-status-open", "market-status-close");
    changeEl.classList.add(diff >= 0 ? "market-status-open" : "market-status-close");
  }

  lastPrice = price;
}

function updateHeaderDisplay(price) {
  const priceSpan = document.querySelector(".hero-price .price");
  const variationSpan = document.querySelector(".hero-price .variation");
  const icon = document.querySelector(".hero-price img");

  if (!priceSpan || !variationSpan || !icon) return;

  priceSpan.textContent = `${price.toFixed(2)} USD`;

  if (lastPrice !== null) {
    const diff = price - lastPrice;
    const percent = ((diff / lastPrice) * 100).toFixed(2);
    const sign = diff >= 0 ? "+" : "";

    variationSpan.textContent = `${sign}${diff.toFixed(2)} (${sign}${percent}%)`;
    icon.src = diff >= 0
      ? "assets/ri_arrow-right-up-long-line.svg"
      : "assets/ri_arrow-right-down-long-line.png";

    variationSpan.classList.remove("market-status-open", "market-status-close");
    variationSpan.classList.add(diff >= 0 ? "market-status-open" : "market-status-close");
  }

  lastPrice = price;
}

document.addEventListener("DOMContentLoaded", async () => {
  const price = await fetchOridPrice();
  if (price !== null) {
    updateMarketDisplay(price);
    updateHeaderDisplay(price);
  }
});