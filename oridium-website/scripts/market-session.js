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
  return new Promise((resolve) => {
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
      }
      updateWalletUI();
      return resolve();
    }

    if (
      session.address !== stored.address ||
      session.pseudo !== stored.pseudo
    ) {
      console.log("🔁 Changement détecté — mise à jour du localStorage");
      localStorage.setItem("orid_wallet_address", session.address);
      localStorage.setItem("orid_wallet_data", JSON.stringify({ pseudo: session.pseudo }));
    }

    updateWalletUI();
    resolve();
  });
}

// 🔁 Initialisation
window.oridWalletSynced = new Promise((resolve) => {
  document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 DOM chargé, tentative de reconnexion via cookie…");
    await syncWalletFromCookie();
    resolve(); // ✅ Résout la promesse globale après sync
  });
});

// Liens dans le header
document.getElementById("wallet-connect")?.addEventListener("click", () => {
  const modal = document.getElementById("connect-wallet-modal");
  const content = modal?.querySelector(".modal-content");
  if (modal && content) {
    modal.classList.remove("hidden");
    content.classList.remove("fade-out");
    content.classList.add("fade-in");
  }
});

document.getElementById("wallet-create")?.addEventListener("click", () => {
  const modal = document.getElementById("wallet-modal");
  const content = modal?.querySelector(".modal-content");
  if (modal && content) {
    modal.classList.remove("hidden");
    content.classList.remove("fade-out");
    content.classList.add("fade-in");
  }
});

// 🔁 Écoute la mise à jour du wallet depuis une autre tab
window.addEventListener("storage", async (event) => {
    if (event.key === "orid_sync_trigger") {
      console.log("🔔 Sync trigger détecté — mise à jour wallet");
      await syncWalletFromCookie();
    }
  });  