console.log("📡 market-session.js loaded");

import { updateWalletUI, getCurrentWallet, getWalletPseudo } from './wallet-bridge.js';
import { displayPublicKey } from './wallet-session.js';

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
      displayPublicKey(null);
      return resolve();
    }

    const hasChanged =
      session.address !== stored.address ||
      session.pseudo !== stored.pseudo;

    if (hasChanged) {
      console.log("🔁 Changement détecté — mise à jour du localStorage");
      localStorage.setItem("orid_wallet_address", session.address);
      localStorage.setItem("orid_wallet_data", JSON.stringify({ pseudo: session.pseudo }));
    }

    updateWalletUI();
    displayPublicKey(session.address);
    resolve();
  });
}

// 🔁 Initialisation au chargement
window.oridWalletSynced = new Promise((resolve) => {
  document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 DOM chargé, tentative de reconnexion via cookie…");
    await syncWalletFromCookie();
    resolve();
  });
});

// 🧠 Liens header
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

// 🔁 Sync dynamique depuis un autre onglet
window.addEventListener("storage", async (event) => {
  if (event.key === "orid_sync_trigger") {
    console.log("🔔 Sync trigger détecté — mise à jour wallet");
    await syncWalletFromCookie();
  }
});