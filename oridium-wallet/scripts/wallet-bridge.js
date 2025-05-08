export function getCurrentWallet() {
  const wallet = localStorage.getItem("orid_wallet_address") || null;
  console.log("📦 getCurrentWallet:", wallet);
  return wallet;
}

export function getWalletPseudo() {
  try {
    const raw = localStorage.getItem("orid_wallet_data");
    const parsed = raw ? JSON.parse(raw) : null;
    const pseudo = parsed?.pseudo || null;
    console.log("📦 getWalletPseudo:", pseudo);
    return pseudo;
  } catch (err) {
    console.warn("⚠️ Error parsing wallet data:", err);
    return null;
  }
}

// ✅ Vérifie que l’appel vient bien du domaine wallet.*
function isWalletDomain() {
  return location.hostname.startsWith("wallet.");
}

function setSession(address, pseudo) {
  if (!isWalletDomain()) {
    console.warn("⛔ Session sync skipped (not wallet domain)");
    return;
  }

  fetch("https://api.getoridium.com/api/set-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ address, pseudo })
  })
  .then(res => {
    if (!res.ok) throw new Error("Set session failed");
    console.log("✅ Session synced to backend");
  })
  .catch(err => {
    console.error("❌ Failed to set session cookie:", err);
  });
}

export function connectWallet() {
  const modal = document.getElementById("connect-wallet-modal");
  const content = modal?.querySelector(".modal-content");

  if (modal && content) {
    modal.classList.remove("hidden");
    content.classList.remove("fade-out");
    content.classList.add("fade-in");
  }

  const address = getCurrentWallet();
  const pseudo = getWalletPseudo();
  if (address && pseudo) setSession(address, pseudo);
}

export function createWallet() {
  const modal = document.getElementById("wallet-modal");
  const content = modal?.querySelector(".modal-content");

  if (modal && content) {
    modal.classList.remove("hidden");
    content.classList.remove("fade-out");
    content.classList.add("fade-in");
  }

  const address = getCurrentWallet();
  const pseudo = getWalletPseudo();
  if (address && pseudo) setSession(address, pseudo);
}

export function updateWalletUI() {
  console.log("🔁 updateWalletUI called");

  const wallet = getCurrentWallet();
  const pseudo = getWalletPseudo();

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
      connectLink.onclick = connectWallet;
    }

    if (createLink) {
      createLink.textContent = "Create wallet";
      createLink.style.display = "inline";
      createLink.onclick = createWallet;
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
      connectLink.onclick = connectWallet;
    }

    if (createLink) {
      createLink.style.display = "none";
    }

    if (orSeparator) {
      orSeparator.style.display = "none";
    }
  }
}

export function disconnectWallet() {
  console.log("🔓 Wallet disconnected");

  localStorage.removeItem("orid_wallet_address");
  localStorage.removeItem("orid_wallet_data");

  // 🔴 Supprime aussi le cookie serveur
  fetch("https://api.getoridium.com/api/set-session", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status: "disconnected" })
  })
  .then(() => {
    console.log("🔁 Session marked as disconnected");
    localStorage.setItem("orid_sync_trigger", Date.now().toString());
    updateWalletUI();
  })
  .catch((err) => {
    console.error("❌ Failed to update session status:", err);
  });  
}