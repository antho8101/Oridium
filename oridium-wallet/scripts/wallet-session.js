import { getBalance, registerWallet } from "./orid-network.js";
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

  const saved = localStorage.getItem("orid_wallet_address");
  if (saved) {
    console.log("🧠 Restoring saved wallet from localStorage:", saved);
    setTimeout(() => {
      setWalletConnected(saved);
    }, 200);
  } else {
    updateWalletButtons(false);
  }
});

export async function setWalletConnected(address) {
  walletConnected = true;
  currentWalletAddress = address;
  localStorage.setItem("orid_wallet_address", address);

  updateWalletButtons(true);
  displayPublicKey(address);
  window.dispatchEvent(new Event("orid-wallet-connected"));

  registerWallet(address)
    .then(() => console.log("📡 Wallet registered on server:", address))
    .catch(err => console.error("❌ Error during wallet registration:", err));

  try {
    const balance = await getBalance(address);
    updateBalanceUI(balance);
  } catch (err) {
    console.error("❌ Failed to fetch balance from server:", err);
  }
}

export function disconnectWallet() {
  walletConnected = false;
  currentWalletAddress = null;
  localStorage.removeItem("orid_wallet_address");

  updateWalletButtons(false);
  displayPublicKey(null);
  updateBalanceUI(0);
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

function updateBalanceUI(balance) {
  const elements = document.querySelectorAll(".balance-amount");
  elements.forEach(el => {
    if (el.closest(".wallet-balance")) {
      el.textContent = `${balance.toFixed(4)} ORID`;
    } else {
      el.textContent = balance.toFixed(4);
    }
  });

  const usdElement = document.querySelector(".orid-value-usd");
  if (usdElement) {
    const valueInUSD = balance * getOridPriceUSD();
    usdElement.textContent = `$${valueInUSD.toFixed(2)}`;
  }
}

// ✅ Gère l’affichage + la copie
function displayPublicKey(address) {
  console.log("🔍 displayPublicKey called with:", address);

  const el = document.getElementById("public-key-display");
  const copyIcon = document.getElementById("copy-public-key");

  if (!el || !copyIcon) return;

  if (address) {
    el.textContent = address;
    copyIcon.style.opacity = "1";
    copyIcon.style.pointerEvents = "auto";
    copyIcon.style.cursor = "pointer";

    copyIcon.onclick = () => {
      navigator.clipboard.writeText(address).then(() => {
        el.textContent = "Copied!";
        setTimeout(() => {
          el.textContent = address;
        }, 1500);
      });
    };

  } else {
    el.textContent = "Connect your wallet to see your public key";
    copyIcon.style.opacity = "0.3";
    copyIcon.style.pointerEvents = "none";
    copyIcon.style.cursor = "default";
    copyIcon.onclick = null;
  }
}

window.disconnectWallet = disconnectWallet;
window.setWalletConnected = setWalletConnected;
window.updateWalletBalanceUI = updateBalanceUI;
window.displayPublicKey = displayPublicKey;
