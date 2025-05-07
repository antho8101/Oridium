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
  
  export function connectWallet() {
    const modal = document.getElementById("connect-wallet-modal");
    const content = modal?.querySelector(".modal-content");
  
    if (modal && content) {
      modal.classList.remove("hidden");
      content.classList.remove("fade-out");
      content.classList.add("fade-in");
    }
  }
  
  export function createWallet() {
    const modal = document.getElementById("wallet-modal");
    const content = modal?.querySelector(".modal-content");
  
    if (modal && content) {
      modal.classList.remove("hidden");
      content.classList.remove("fade-out");
      content.classList.add("fade-in");
    }
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
  
      welcomeEl.textContent = "Welcome";
  
      if (connectLink) {
        connectLink.textContent = "Connect your wallet";
        connectLink.style.display = "inline";
        connectLink.onclick = () => {
          const modal = document.getElementById("connect-wallet-modal");
          const content = modal?.querySelector(".modal-content");
          if (modal && content) {
            modal.classList.remove("hidden");
            content.classList.remove("fade-out");
            content.classList.add("fade-in");
          }
        };
      }
  
      if (createLink) {
        createLink.textContent = "Create wallet";
        createLink.style.display = "inline";
        createLink.onclick = () => {
          const modal = document.getElementById("wallet-modal");
          const content = modal?.querySelector(".modal-content");
          if (modal && content) {
            modal.classList.remove("hidden");
            content.classList.remove("fade-out");
            content.classList.add("fade-in");
          }
        };
      }
  
      if (orSeparator) {
        orSeparator.style.display = "inline";
      }
  
    } else {
      console.log("✅ Wallet connected with pseudo:", pseudo);
  
      welcomeEl.textContent = `Welcome, ${pseudo || "User"}`;
  
      if (connectLink) {
        connectLink.textContent = "Change wallet";
        connectLink.style.display = "inline";
        connectLink.onclick = () => {
          const modal = document.getElementById("connect-wallet-modal");
          const content = modal?.querySelector(".modal-content");
          if (modal && content) {
            modal.classList.remove("hidden");
            content.classList.remove("fade-out");
            content.classList.add("fade-in");
          }
        };
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
  
    updateWalletUI();
  }
  