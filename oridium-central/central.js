import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

async function getFirebaseConfig() {
  const res = await fetch('/api/get-api-key');
  const data = await res.json();

  return {
    apiKey: data.apiKey,
    authDomain: "oridium-central.firebaseapp.com",
    projectId: "oridium-central",
    storageBucket: "oridium-central.firebasestorage.app",
    messagingSenderId: "521644806669",
    appId: "1:521644806669:web:88722b2b2706acc453bb44"
  };
}

const app = initializeApp(await getFirebaseConfig());
const auth = getAuth(app);

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("login-error");
const dashboard = document.getElementById("dashboard");
const loginContainer = document.getElementById("login-container");
const logoutBtn = document.getElementById("logout");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => (loginError.textContent = ""))
    .catch((error) => (loginError.textContent = "❌ " + error.message));
});

onAuthStateChanged(auth, async (user) => {
  const visible = !!user;
  dashboard.style.display = visible ? "block" : "none";
  loginContainer.style.display = visible ? "none" : "block";

  if (visible) {
    refreshStockDisplay();
    updateCountdown();
    loadBannedWallets();
  }
});

logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

async function refreshStockDisplay() {
  try {
    const res = await fetch("https://api.getoridium.com/api/stock");
    const data = await res.json();
    document.getElementById("orid-stock").textContent = `${data.available} ORID`;
    document.getElementById("manual-stock").textContent = `${data.available} ORID`;
  } catch (err) {
    console.error("❌ Erreur lors de la récupération du stock :", err);
  }
}

document.getElementById("refresh-stock").addEventListener("click", refreshStockDisplay);

async function updateCountdown() {
  try {
    const res = await fetch("https://api.getoridium.com/api/stock");
    const { generatedAt } = await res.json();
    const start = new Date(generatedAt);
    const nextReset = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const countdownEl = document.getElementById("countdown");

    function refreshTimer() {
      const now = new Date();
      const diff = Math.max(0, nextReset - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      countdownEl.textContent = `${days}j ${hours}h ${mins}m ${secs}s`;
    }

    refreshTimer();
    setInterval(refreshTimer, 1000);
  } catch (err) {
    console.error("❌ Erreur dans le calcul du countdown :", err);
  }
}

document.getElementById("send-orid-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const wallet = document.getElementById("target-wallet").value;
  const amount = parseFloat(document.getElementById("amount-orid").value);
  const status = document.getElementById("send-status");

  try {
    const res = await fetch("https://api.getoridium.com/api/send-orid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet, amount })
    });

    const result = await res.json();
    if (result.success) {
      status.textContent = "✅ ORID envoyés avec succès.";
      refreshStockDisplay();
    } else {
      status.textContent = "❌ " + result.error;
    }
  } catch (err) {
    status.textContent = "❌ Erreur réseau lors de l’envoi.";
    console.error(err);
  }
});

// 🔒 via proxy sécurisé
async function loadBannedWallets() {
  try {
    const res = await fetch("/api/ban");
    const { wallets } = await res.json();
    const list = document.getElementById("banned-wallets-list");
    list.innerHTML = "";
    wallets.forEach((addr) => {
      const li = document.createElement("li");
      li.textContent = addr.address;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("❌ Erreur chargement banlist:", err);
  }
}

document.getElementById("refresh-banned").addEventListener("click", loadBannedWallets);

document.getElementById("ban-wallet-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const address = document.getElementById("ban-wallet").value;
  const status = document.getElementById("ban-status");

  try {
    const res = await fetch("/api/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address })
    });

    const result = await res.json();
    if (result.success) {
      status.textContent = "✅ Wallet banni.";
      loadBannedWallets();
    } else {
      status.textContent = "❌ " + result.error;
    }
  } catch (err) {
    status.textContent = "❌ Erreur réseau.";
  }
});

document.getElementById("unban-wallet-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const address = document.getElementById("unban-wallet").value;
  const status = document.getElementById("unban-status");

  try {
    const res = await fetch("/api/ban/unban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address })
    });

    const result = await res.json();
    if (result.success) {
      status.textContent = "✅ Wallet débanni.";
      loadBannedWallets();
    } else {
      status.textContent = "❌ " + result.error;
    }
  } catch (err) {
    status.textContent = "❌ Erreur réseau.";
  }
});