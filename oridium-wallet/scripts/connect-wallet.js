import { getPublicKey } from 'https://esm.sh/@noble/secp256k1@1.7.1';
import { keccak256 } from 'https://esm.sh/ethereum-cryptography/keccak';
import { bytesToHex, hexToBytes } from 'https://esm.sh/@noble/hashes/utils';
import { playWelcomeIntro } from './intro.js';
import { setWalletConnected } from './wallet-session.js';
import { registerWallet } from './orid-network.js';

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("connect-wallet-modal");
  const modalContent = modal.querySelector(".modal-content");
  const openBtn = document.getElementById("connect-wallet-button");

  const fileInput = document.getElementById("connect-json-file");
  const passwordContainer = document.getElementById("connect-json-password-container");
  const passwordInput = document.getElementById("connect-json-password");
  const passwordError = document.getElementById("connect-password-error");

  const confirmBtn = document.getElementById("connect-wallet-confirm");
  const closeBtn = document.getElementById("close-connect-wallet-modal");

  let walletData = null;

  openBtn?.addEventListener("click", () => {
    modal.classList.remove("hidden");
    passwordContainer.classList.add("hidden");
    passwordInput.value = "";
    passwordError.classList.add("hidden");
    modalContent.classList.remove("fade-out");
    modalContent.classList.add("fade-in");
  });

  function closeModal() {
    modal.classList.add("no-blur");
    modalContent.classList.remove("fade-in");
    modalContent.classList.add("fade-out");

    setTimeout(() => {
      modal.classList.add("hidden");
      modal.classList.remove("no-blur");
      modalContent.classList.remove("fade-out");
    }, 300);
  }

  closeBtn?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
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

  function toggleWalletButtons(connected) {
    const connectBtn = document.getElementById("connect-wallet-button");
    const disconnectBtn = document.getElementById("disconnect-wallet-button");

    if (connected) {
      connectBtn?.classList.add("hidden");
      disconnectBtn?.classList.remove("hidden");
    } else {
      connectBtn?.classList.remove("hidden");
      disconnectBtn?.classList.add("hidden");
    }
  }

  const wallet = localStorage.getItem("orid_wallet_address");
  toggleWalletButtons(!!wallet);

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

    toggleWalletButtons(false);

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

      closeModal();
      playWelcomeIntro();
      setWalletConnected(address);

    } catch (err) {
      console.warn("❌ Failed to connect wallet:", err);
      passwordError.textContent = "Failed to decrypt wallet. Check password.";
      passwordError.classList.remove("hidden");
    }
  });
});