console.log("📡 market-session.js loaded");

let lastSync = localStorage.getItem("orid_sync_trigger");

// ✅ Appel côté serveur pour récupérer la session depuis le cookie sécurisé
async function getParsedSessionFromServer() {
  console.log("🌐 getParsedSessionFromServer called");

  try {
    const res = await fetch('https://api.getoridium.com/api/wallet-sync', {
      method: 'GET',
      credentials: 'include'
    });

    const data = await res.json();
    console.log("📥 Session from server:", data);

    if (!data || !data.address || data.status === "disconnected") {
      console.log("❌ Invalid or disconnected session");
      return null;
    }

    return data;
  } catch (err) {
    console.warn("⚠️ Failed to fetch session:", err);
    return null;
  }
}

async function syncWalletFromSession() {
  console.log("🔄 syncWalletFromSession called");

  const session = await getParsedSessionFromServer();
  const stored = {
    address: localStorage.getItem("orid_wallet_address"),
    pseudo: (() => {
      try {
        const raw = localStorage.getItem("orid_wallet_data");
        return raw ? JSON.parse(raw).pseudo : null;
      } catch (err) {
        console.warn("⚠️ Failed to parse stored pseudo:", err);
        return null;
      }
    })()
  };

  console.log("🧾 Stored values:", stored);

  if (!session) {
    if (stored.address || stored.pseudo) {
      console.log("🧹 Clearing stale wallet session");
      localStorage.removeItem("orid_wallet_address");
      localStorage.removeItem("orid_wallet_data");
    } else {
      console.log("💤 No session and nothing stored — nothing to do");
    }
    updateWalletUI();
    return;
  }

  if (
    session.address !== stored.address ||
    session.pseudo !== stored.pseudo
  ) {
    console.log("🔁 Updating wallet localStorage from session");
    localStorage.setItem("orid_wallet_address", session.address);
    localStorage.setItem("orid_wallet_data", JSON.stringify({ pseudo: session.pseudo }));
  } else {
    console.log("✅ Wallet already in sync");
  }

  updateWalletUI();
}

// 🔁 Polling en cas de changement forcé par localStorage
function startPolling(interval = 1500) {
  console.log("⏱️ Polling started every", interval, "ms");

  setInterval(() => {
    const now = localStorage.getItem("orid_sync_trigger");
    if (now && now !== lastSync) {
      lastSync = now;
      console.log("🔔 Trigger detected, syncing wallet");
      syncWalletFromSession();
    }
  }, interval);
}

// ✅ Initialisation protégée
if (!window.oridWalletSynced) {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 DOM ready → initial sync");
    window.oridWalletSynced = syncWalletFromSession();
    startPolling();
  });
}

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
  const buyBtn = document.querySelector(".market-buy-button");

  console.log("🔍 Elements found:", {
    welcomeEl: !!welcomeEl,
    connectLink: !!connectLink,
    createLink: !!createLink,
    orSeparator: !!orSeparator,
    buyBtn: !!buyBtn
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

    if (buyBtn) {
      buyBtn.textContent = "Connect your wallet to buy ORID";
      buyBtn.classList.add("disabled");
      buyBtn.style.opacity = "0.5";
      buyBtn.style.pointerEvents = "none";
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

    if (buyBtn) {
      buyBtn.textContent = "Buy ORID";
      buyBtn.classList.remove("disabled");
      buyBtn.style.opacity = "1";
      buyBtn.style.pointerEvents = "auto";
    }
  }
}
