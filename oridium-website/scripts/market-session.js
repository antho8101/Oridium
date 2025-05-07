import { updateWalletUI } from './wallet-bridge.js';

console.log("📡 market-session.js loaded");

let lastSync = localStorage.getItem("orid_sync_trigger");

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
    console.warn("⚠️ Cookie decode failed:", err);
    return null;
  }
}

function syncWalletFromSession() {
  const session = getParsedSessionCookie();
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