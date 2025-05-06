export function getCurrentWallet() {
    return localStorage.getItem("orid_wallet_address") || null;
  }
  
  export function getWalletPseudo() {
    try {
      const raw = localStorage.getItem("orid_wallet_data");
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.pseudo || null;
    } catch {
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
    const wallet = getCurrentWallet();
    const pseudo = getWalletPseudo();
  
    const buyBtn = document.getElementById("buy-orid-btn");
    const walletLink = document.getElementById("wallet-link");
    const welcomeEl = document.getElementById("welcome-user");
  
    if (!buyBtn || !walletLink || !welcomeEl) return;
  
    if (!wallet) {
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
      buyBtn.textContent = "Buy ORID";
      buyBtn.onclick = null;
  
      walletLink.textContent = "Change wallet";
      walletLink.onclick = connectWallet;
  
      welcomeEl.textContent = `Welcome, ${pseudo || "User"}`;
    }
  }  