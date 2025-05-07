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
  const session = await getParsedSessionFromServer();
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

// 🔁 Polling en cas de changement forcé par localStorage
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

// ✅ Initialisation
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM ready → initial sync");
  window.oridWalletSynced = syncWalletFromSession();
  startPolling();
});

function updateWalletUI() {
  console.log("🔁 updateWalletUI called");

  const wallet = localStorage.getItem("orid_wallet_address");
  let pseudo = null;
  try {
    const raw = localStorage.getItem("orid_wallet_data");
    pseudo = raw ? JSON.parse(raw).pseudo : null;
  } catch (err) {
    console.warn("⚠️ Failed to parse pseudo:", err);
  }

  const welcomeEl = document.getElementById("welcome-user");
  const connectLink = document.getElementById("wallet-link-connect");
  const createLink = document.getElementById("wallet-link-create");
  const orSeparator = document.getElementById("wallet-or");

  console.log("🔍 Elements found:", {
    welcomeEl: !!welcomeEl,
    connectLink: !!connectLink,
    createLink: !!createLink,
    orSeparator: !!orSeparator
  });

  if (!wallet) {
    console.log("🔌 No wallet connected");
    if (welcomeEl) welcomeEl.textContent = "Welcome";

    if (connectLink) {
      connectLink.textContent = "Connect your wallet";
      connectLink.style.display = "inline";
    }

    if (createLink) {
      createLink.textContent = "Create wallet";
      createLink.style.display = "inline";
    }

    if (orSeparator) {
      orSeparator.style.display = "inline";
    }
  } else {
    console.log("✅ Wallet connected with pseudo:", pseudo);
    if (welcomeEl) welcomeEl.textContent = `Welcome, ${pseudo || "User"}`;

    if (connectLink) {
      connectLink.textContent = "Change wallet";
      connectLink.style.display = "inline";
    }

    if (createLink) {
      createLink.style.display = "none";
    }

    if (orSeparator) {
      orSeparator.style.display = "none";
    }
  }
}