import { getBalance } from "./orid-network.js";
import { getOridPriceUSD } from "./orid-pricing.js";
import { registerWallet } from "./orid-network.js";

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

  const saved = localStorage.getItem("orid_wallet_address");
  if (saved) {
    console.log("🧠 Restoring saved wallet from localStorage:", saved);
    setWalletConnected(saved);
  }

  updateWalletButtons(false);
});

export function setWalletConnected(address) {
  walletConnected = true;
  currentWalletAddress = address;
  localStorage.setItem("orid_wallet_address", address);

  updateWalletButtons(true);

  if (window.displayPublicKey) {
    window.displayPublicKey(address);
    window.dispatchEvent(new Event("orid-wallet-connected"));
  }

  registerWallet(address)
    .then(() => console.log("📡 Wallet registered on server:", address))
    .catch(err => console.error("❌ Error during wallet registration:", err));

  updateWalletBalanceUI(address);
}

export function disconnectWallet() {
  walletConnected = false;
  currentWalletAddress = null;
  localStorage.removeItem("orid_wallet_address");
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

export async function updateWalletBalanceUI(address) {
  if (!address) return;

  try {
    const balance = await getBalance(address);
    const balanceElements = document.querySelectorAll(".balance-amount");
    balanceElements.forEach(el => {
      const isInsideWalletBalance = el.closest(".wallet-balance") !== null;
      el.textContent = isInsideWalletBalance ? `${balance.toFixed(4)} ORID` : balance.toFixed(4);
    });

    const usd = balance * getOridPriceUSD();
    const usdElement = document.querySelector(".orid-value-usd");
    if (usdElement) usdElement.textContent = `$${usd.toLocaleString()}`;
  } catch (err) {
    console.error("❌ Failed to update balance from server:", err);
  }
}

window.disconnectWallet = disconnectWallet;
window.setWalletConnected = setWalletConnected;
window.updateWalletBalanceUI = updateWalletBalanceUI;
