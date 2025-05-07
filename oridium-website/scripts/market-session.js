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

  // Si le cookie a été supprimé, on reset le localStorage
  if (!session) {
    if (stored.address || stored.pseudo) {
      console.log("🔁 Cookie supprimé — reset localStorage");
      localStorage.removeItem("orid_wallet_address");
      localStorage.removeItem("orid_wallet_data");
    }
    updateWalletUI();
    return;
  }

  // Si les données ont changé → mise à jour du localStorage
  if (
    session.address !== stored.address ||
    session.pseudo !== stored.pseudo
  ) {
    console.log("🔁 Changement détecté — update localStorage");
    localStorage.setItem("orid_wallet_address", session.address);
    localStorage.setItem("orid_wallet_data", JSON.stringify({ pseudo: session.pseudo }));
  }

  updateWalletUI();
}

// 🔁 Initialisation au chargement
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM chargé → tentative de sync…");
  syncWalletFromCookie();
});

// 🔁 Écoute les changements cross-tab
window.addEventListener("storage", (event) => {
  if (event.key === "orid_sync_trigger") {
    console.log("🔔 Sync cross-tab détecté → mise à jour du wallet");
    syncWalletFromCookie();
  }
});
