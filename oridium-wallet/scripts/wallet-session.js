import { getWalletBalance } from "./blockchain-bridge.js";
import { getOridPriceUSD } from "./orid-pricing.js";

let walletConnected = false;
let currentWalletAddress = null;

document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connect-wallet-button");
  const disconnectBtn = document.getElementById("disconnect-wallet-button");

  connectBtn?.addEventListener("click", () => {
    if (!walletConnected) {
      const modal = document.getElementById("connect-wallet-modal");
      const modalContent = modal?.querySelector(".modal-content");
      if (modal && modalContent) {
        modal.classList.remove("hidden");
        modalContent.classList.remove("fade-out");
        modalContent.classList.add("fade-in");
      }
    }
  });

  disconnectBtn?.addEventListener("click", () => {
    disconnectWallet();
    console.log("👋 Wallet disconnected");
  });

  updateWalletButtons(false);
});

export function setWalletConnected(address) {
  walletConnected = true;
  currentWalletAddress = address;
  updateWalletButtons(true);

  if (window.displayPublicKey) {
    window.displayPublicKey(address);
    window.dispatchEvent(new Event("orid-wallet-connected"));

  }

  updateWalletBalanceUI(address); // ✅ Appel direct (pas via window)
}

export function disconnectWallet() {
  walletConnected = false;
  currentWalletAddress = null;
  updateWalletButtons(false);

  if (window.displayPublicKey) {
    window.displayPublicKey(null);
  }
}

export function getConnectedWalletAddress() {
  return currentWalletAddress;
}

export function updateWalletButtons(isConnected) {
  const connectBtn = document.getElementById("connect-wallet-button");
  const disconnectBtn = document.getElementById("disconnect-wallet-button");

  if (!connectBtn || !disconnectBtn) return;

  if (isConnected) {
    connectBtn.classList.add("hidden");
    disconnectBtn.classList.remove("hidden");
  } else {
    connectBtn.classList.remove("hidden");
    disconnectBtn.classList.add("hidden");
  }
}

export function updateWalletBalanceUI(address) {
  if (!address) return;

  try {
    const balance = getWalletBalance(address);

    // 🔄 Met à jour tous les .balance-amount
    const balanceElements = document.querySelectorAll(".balance-amount");
    balanceElements.forEach(el => {
      const isInsideWalletBalance = el.closest(".wallet-balance") !== null;
      el.textContent = isInsideWalletBalance ? `${balance.toFixed(4)} ORID` : balance.toFixed(4);
    });

    // 🔄 Met à jour la valeur USD estimée (optionnel)
    const usd = balance * getOridPriceUSD();
    const usdElement = document.querySelector(".orid-value-usd");
    if (usdElement) usdElement.textContent = `$${usd.toLocaleString()}`;

  } catch (err) {
    console.error("❌ Failed to update UI with balance:", err);
  }
}

// Pour usage global si besoin
window.disconnectWallet = disconnectWallet;
window.setWalletConnected = setWalletConnected;
window.updateWalletBalanceUI = updateWalletBalanceUI;