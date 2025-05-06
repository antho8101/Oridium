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
  
    const buyBtn = document.getElementById("buy-orid-btn");
    const walletLink = document.getElementById("wallet-link");
    const welcomeEl = document.getElementById("welcome-user");
  
    console.log("🔍 Elements found:", {
      buyBtn: !!buyBtn,
      walletLink: !!walletLink,
      welcomeEl: !!welcomeEl
    });
  
    if (!buyBtn || !walletLink || !welcomeEl) {
      console.warn("❌ Missing DOM elements in updateWalletUI");
      return;
    }
  
    if (!wallet) {
      console.log("🔌 No wallet connected");
      buyBtn.textContent = "Connect your wallet";
      buyBtn.onclick = connectWallet;
  
      walletLink.textContent = "Connect your wallet or create wallet";
      walletLink.onclick = () => {
        const choice = confirm("Do you already have a wallet?");
        if (choice) connectWallet();
        else createWallet();
      };
  
      welcomeEl.textContent = "Welcome, guest";
    } else {
      console.log("✅ Wallet connected with pseudo:", pseudo);
      buyBtn.textContent = "Buy ORID";
      buyBtn.onclick = null;
  
      walletLink.textContent = "Change wallet";
      walletLink.onclick = connectWallet;
  
      welcomeEl.textContent = `Welcome, ${pseudo || "User"}`;
    }
  }  