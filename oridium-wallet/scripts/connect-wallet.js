import { getPublicKey } from 'https://esm.sh/@noble/secp256k1@1.7.1';
import { keccak256 } from 'https://esm.sh/ethereum-cryptography/keccak';
import { bytesToHex, hexToBytes } from 'https://esm.sh/@noble/hashes/utils';
import { playWelcomeIntro } from './intro.js';
import { setWalletConnected } from './wallet-session.js';
import { registerWallet } from './orid-network.js';

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const modalType = params.get("modal"); // "connect" ou "create"
  const logout = params.get("logout") === "1";

  const connectModal = document.getElementById("connect-wallet-modal");
  const connectModalContent = connectModal.querySelector(".modal-content");
  const createModal = document.getElementById("wallet-modal");
  const createModalContent = createModal.querySelector(".modal-content");

  const openConnectBtn = document.getElementById("connect-wallet-button");

  const fileInput = document.getElementById("connect-json-file");
  const passwordContainer = document.getElementById("connect-json-password-container");
  const passwordInput = document.getElementById("connect-json-password");
  const passwordError = document.getElementById("connect-password-error");

  const confirmBtn = document.getElementById("connect-wallet-confirm");
  const closeConnectBtn = document.getElementById("close-connect-wallet-modal");

  let walletData = null;

  function openModal(modal, modalContent) {
    modal.classList.remove("hidden");
    modalContent.classList.remove("fade-out");
    modalContent.classList.add("fade-in");
  }

  function closeModal(modal, modalContent) {
    modal.classList.add("no-blur");
    modalContent.classList.remove("fade-in");
    modalContent.classList.add("fade-out");
    setTimeout(() => {
      modal.classList.add("hidden");
      modal.classList.remove("no-blur");
      modalContent.classList.remove("fade-out");
    }, 300);
  }

  // ⛔ Déconnexion automatique
  if (logout) {
    localStorage.removeItem("orid_wallet_address");
    localStorage.removeItem("orid_wallet_data");
    document.cookie = "orid_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.setItem("orid_sync_trigger", Date.now().toString());
    console.log("🔌 Auto logout triggered");
  }

  // ✅ Ouverture automatique modale si demandé
  if (modalType === "connect") {
    openModal(connectModal, connectModalContent);
  } else if (modalType === "create") {
    openModal(createModal, createModalContent);
  }

  // ✅ Ouverture manuelle
  openConnectBtn?.addEventListener("click", () => {
    openModal(connectModal, connectModalContent);
    passwordContainer.classList.add("hidden");
    passwordInput.value = "";
    passwordError.classList.add("hidden");
  });

  closeConnectBtn?.addEventListener("click", () => {
    closeModal(connectModal, connectModalContent);
  });

  connectModal?.addEventListener("click", (e) => {
    if (e.target === connectModal) closeModal(connectModal, connectModalContent);
  });

  fileInput?.addEventListener("change", async () => {
    passwordError.classList.add("hidden");
    const file = fileInput.files[0];
    if (!file) return;

    try {
      const content = await file.text();
      walletData = JSON.parse(content);
      const encrypted = walletData.encrypted || walletData.privateKeyEncrypted;
      passwordContainer.classList.toggle("hidden", !encrypted);
    } catch (err) {
      passwordError.textContent = "Invalid file format.";
      passwordError.classList.remove("hidden");
      walletData = null;
    }
  });

  const disconnectBtn = document.getElementById("disconnect-wallet-button");
  disconnectBtn?.addEventListener("click", () => {
    console.log("🚪 Disconnecting wallet");

    localStorage.removeItem("orid_wallet_address");
    localStorage.removeItem("orid_wallet_data");
    document.cookie = "orid_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.setItem("orid_sync_trigger", Date.now().toString());

    const welcomeEl = document.getElementById("welcome-user");
    if (welcomeEl) {
      welcomeEl.textContent = "Welcome";
      welcomeEl.classList.add("hidden");
    }

    const pubKeyDisplay = document.getElementById("public-key-display");
    if (pubKeyDisplay) pubKeyDisplay.textContent = "Connect your wallet to see your public key";

    console.log("✅ Wallet disconnected");
  });

  confirmBtn?.addEventListener("click", async () => {
    if (!walletData) return;

    try {
      let privateKey = walletData.privateKey;
      const encrypted = walletData.encrypted || walletData.privateKeyEncrypted;

      if (encrypted) {
        const { decryptPrivateKey } = await import('./utils/crypto.js');
        const password = passwordInput.value.trim();
        if (!password) {
          passwordError.textContent = "Password required.";
          passwordError.classList.remove("hidden");
          return;
        }

        privateKey = await decryptPrivateKey(encrypted, password, walletData.iv);
      }

      console.log("🔓 Decrypted private key:", privateKey);
      if (!/^[0-9a-f]{64}$/i.test(privateKey)) throw new Error("Invalid private key");

      const privBytes = Uint8Array.from(hexToBytes(privateKey));
      const pubBytes = getPublicKey(privBytes, false);
      const hash = keccak256(pubBytes.slice(1));
      const address = "0x" + bytesToHex(hash.slice(-20));

      console.log("✅ Wallet connected! Address:", address);

      await registerWallet(address)
        .then(() => console.log("📡 Address sent to server successfully"))
        .catch(err => console.error("❌ Failed to notify server:", err));

      walletData.publicKey = address;
      localStorage.setItem("orid_wallet_address", address);
      localStorage.setItem("orid_wallet_data", JSON.stringify(walletData));
      localStorage.setItem("orid_sync_trigger", Date.now().toString());

      document.cookie = `orid_session=${btoa(JSON.stringify({
        address,
        pseudo: walletData.pseudo || ""
      }))}; path=/; SameSite=Lax`;

      const welcomeEl = document.getElementById("welcome-user");
      if (walletData?.pseudo && welcomeEl) {
        welcomeEl.textContent = `Welcome, ${walletData.pseudo}`;
        welcomeEl.classList.remove("hidden");
      }

      closeModal(connectModal, connectModalContent);
      playWelcomeIntro();
      setWalletConnected(address);

      if (params.get("from") === "market") {
        showReturnToMarketModal();
      }

    } catch (err) {
      console.warn("❌ Failed to connect wallet:", err);
      passwordError.textContent = "Failed to decrypt wallet. Check password.";
      passwordError.classList.remove("hidden");
    }
  });
});

function showReturnToMarketModal() {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
  overlay.style.zIndex = 9999;
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";

  const modal = document.createElement("div");
  modal.style.background = "#191A21";
  modal.style.border = "1px solid #DCCB92";
  modal.style.borderRadius = "30px";
  modal.style.padding = "40px";
  modal.style.color = "#fff";
  modal.style.textAlign = "center";
  modal.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4)";
  modal.style.maxWidth = "400px";
  modal.style.fontFamily = "inherit";

  const title = document.createElement("h2");
  title.textContent = "✅ Wallet connected!";
  title.style.marginBottom = "20px";

  const text = document.createElement("p");
  text.textContent = "Return to the Market to complete your purchase?";
  text.style.marginBottom = "30px";

  const btnReturn = document.createElement("button");
  btnReturn.textContent = "← Back to Market";
  btnReturn.className = "button-icon-gold";
  btnReturn.style.marginRight = "10px";
  btnReturn.onclick = () => {
    window.location.href = "https://getoridium.com/market.html";
  };

  const btnStay = document.createElement("button");
  btnStay.textContent = "Stay here";
  btnStay.className = "button-icon-black";
  btnStay.onclick = () => {
    overlay.remove();
  };

  modal.appendChild(title);
  modal.appendChild(text);
  modal.appendChild(btnReturn);
  modal.appendChild(btnStay);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}