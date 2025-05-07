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
  
    console.log("🔍 Elements found:", {
      welcomeEl: !!welcomeEl,
      connectLink: !!connectLink,
      createLink: !!createLink
    });
  
    if (!wallet) {
      console.log("🔌 No wallet connected");
  
      // Texte d’accueil sans pseudo
      welcomeEl.textContent = "Welcome";
  
      // Affiche les deux liens
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
  
    } else {
      console.log("✅ Wallet connected with pseudo:", pseudo);
  
      // Affiche le pseudo dans le welcome
      welcomeEl.textContent = `Welcome, ${pseudo || "User"}`;
  
      // Affiche "Change wallet" à la place des deux liens
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
    }
  }  