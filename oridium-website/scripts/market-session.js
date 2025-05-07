import { updateWalletUI } from './wallet-bridge.js';

console.log("📡 market-session.js loaded");

let lastSync = localStorage.getItem("orid_sync_trigger");

// ✅ Appel côté serveur pour récupérer la session depuis le cookie sécurisé
async function getParsedSessionFromServer() {
  try {
    const res = await fetch('https://oridium-production.up.railway.app/api/wallet-sync', {
      method: 'GET',
      credentials: 'include'
    });

    const data = await res.json();
    console.log("📥 Session from server:", data);

    if (!data || !data.address) return null;
    return data;
  } catch (err) {
    console.warn("⚠️ Failed to fetch session:", err);
    return null;
  }
}

async function syncWalletFromSession() {
  const session = await getParsedSessionFromServer(); // 🔁 Appel API au lieu du cookie local
  const stored = {
    address: localStorage.getItem("orid_wallet_address"),
    pseudo: (() => {
      try {
        const raw = localStorage.getItem("orid_wallet_data");
        return raw ? JSON.parse(raw).pseudo : null;
      } catch {
        return null;
      }
    })()
  };

  if (!session) {
    if (stored.address || stored.pseudo) {
      console.log("🧹 Clearing stale wallet session");
      localStorage.removeItem("orid_wallet_address");
      localStorage.removeItem("orid_wallet_data");
    }
    updateWalletUI();
    return;
  }

  if (
    session.address !== stored.address ||
    session.pseudo !== stored.pseudo
  ) {
    console.log("🔄 Syncing wallet session");
    localStorage.setItem("orid_wallet_address", session.address);
    localStorage.setItem("orid_wallet_data", JSON.stringify({ pseudo: session.pseudo }));
  }

  updateWalletUI();
}

function startPolling(interval = 1500) {
  setInterval(() => {
    const now = localStorage.getItem("orid_sync_trigger");
    if (now && now !== lastSync) {
      lastSync = now;
      console.log("🔔 Trigger detected, syncing wallet");
      syncWalletFromSession();
    }
  }, interval);
}

// Initial sync
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM ready → initial sync");
  syncWalletFromSession();
  startPolling();
});