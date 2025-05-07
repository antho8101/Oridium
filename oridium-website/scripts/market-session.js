// 📡 market-session.js chargé
console.log("📡 market-session.js loaded");

import { updateWalletUI } from './wallet-bridge.js';

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function getParsedSessionCookie() {
  const data = getCookie('orid_session');
  if (!data) return null;

  try {
    return JSON.parse(atob(data));
  } catch (err) {
    console.warn("⚠️ Erreur de décodage du cookie orid_session:", err);
    return null;
  }
}

function syncWalletFromCookie() {
  const session = getParsedSessionCookie();

  const stored = {
    address: localStorage.getItem("orid_wallet_address"),
    pseudo: (() => {
      try {
        const raw = localStorage.getItem("orid_wallet_data");
        return raw ? JSON.parse(raw).pseudo : null;
      } catch (err) {
        return null;
      }
    })()
  };

  if (!session) {
    if (stored.address || stored.pseudo) {
      console.log("🔁 Session cookie supprimé — reset localStorage");
      localStorage.removeItem("orid_wallet_address");
      localStorage.removeItem("orid_wallet_data");
      updateWalletUI();
    }
    return;
  }

  if (
    session.address !== stored.address ||
    session.pseudo !== stored.pseudo
  ) {
    console.log("🔁 Changement détecté — mise à jour du localStorage");
    localStorage.setItem("orid_wallet_address", session.address);
    localStorage.setItem("orid_wallet_data", JSON.stringify({ pseudo: session.pseudo }));
    updateWalletUI();
  }
}

// 🔁 Polling toutes les 3s
setInterval(syncWalletFromCookie, 3000);

// 🔁 Initialisation
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM chargé, tentative de reconnexion via cookie…");
  syncWalletFromCookie();

  const connectBtn = document.getElementById("wallet-connect");
  const createBtn = document.getElementById("wallet-create");

  connectBtn?.addEventListener("click", () => {
    const modal = document.getElementById("connect-wallet-modal");
    const content = modal?.querySelector(".modal-content");
    if (modal && content) {
      modal.classList.remove("hidden");
      content.classList.remove("fade-out");
      content.classList.add("fade-in");
    }
  });

  createBtn?.addEventListener("click", () => {
    const modal = document.getElementById("wallet-modal");
    const content = modal?.querySelector(".modal-content");
    if (modal && content) {
      modal.classList.remove("hidden");
      content.classList.remove("fade-out");
      content.classList.add("fade-in");
    }
  });
});