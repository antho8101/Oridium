import { getWalletBalance } from "./blockchain-bridge.js";

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
  const balanceSpan = document.querySelector(".wallet-balance .balance-amount");
  if (!balanceSpan || !address) return;

  try {
    const balance = getWalletBalance(address);
    if (typeof balance === "number") {
      balanceSpan.textContent = `${balance.toFixed(4)} ($ORID)`;
    } else {
      balanceSpan.textContent = `0.0000 ($ORID)`;
    }
  } catch (err) {
  
    balanceSpan.textContent = `0.0000 ($ORID)`;
  }
}

// Pour usage global si besoin
window.disconnectWallet = disconnectWallet;
window.setWalletConnected = setWalletConnected;
window.updateWalletBalanceUI = updateWalletBalanceUI;