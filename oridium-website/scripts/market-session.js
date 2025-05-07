// 📡 market-session.js chargé
console.log("📡 market-session.js loaded");

import { updateWalletUI } from './wallet-bridge.js';

// Lire un cookie
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Tentative d'auto-connexion via le cookie partagé
export function autoConnectFromCookie() {
  const data = getCookie('orid_session');

  if (!data) {
    console.log("❌ Aucun cookie orid_session trouvé");

    // 💡 Synchronise l’état en local
    localStorage.removeItem("orid_wallet_address");
    localStorage.removeItem("orid_wallet_data");

    updateWalletUI();
    return;
  }

  console.log("🍪 Cookie orid_session brut:", data);

  try {
    const parsed = JSON.parse(atob(data)); // base64 → JSON
    console.log("✅ Données décodées du cookie:", parsed);

    const { address, pseudo } = parsed;

    if (address && pseudo) {
      console.log("🔐 Session trouvée —", address, pseudo);

      // Simule une connexion locale
      localStorage.setItem("orid_wallet_address", address);
      localStorage.setItem("orid_wallet_data", JSON.stringify({ pseudo }));
    } else {
      console.warn("⚠️ Adresse ou pseudo manquant dans le cookie.");
    }

  } catch (err) {
    console.warn("⚠️ Erreur de décodage du cookie orid_session:", err);
  }

  updateWalletUI(); // met à jour l’interface dans tous les cas
}

// 🔁 Initialisation
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM chargé, tentative de reconnexion via cookie…");
  autoConnectFromCookie();

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