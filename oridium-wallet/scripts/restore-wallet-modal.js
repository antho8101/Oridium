import { getPublicKey } from 'https://esm.sh/@noble/secp256k1@1.7.1';
import { keccak256 } from 'https://esm.sh/ethereum-cryptography/keccak';
import { bytesToHex } from 'https://esm.sh/@noble/hashes/utils';

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("restore-wallet-modal");
  const openBtn = document.querySelectorAll(".button-menu")[1];
  const closeBtn = document.getElementById("close-restore-wallet-modal");
  const confirmBtn = document.getElementById("restore-wallet-confirm");
  const downloadBtn = document.getElementById("download-restored-wallet");

  const inputSeed = document.getElementById("restore-seed-phrase-input");
  const encryptToggle = document.getElementById("restore-encrypt-toggle");
  const passwordContainer = document.getElementById("restore-password-container");
  const passwordInput = document.getElementById("restore-wallet-password");
  const passwordConfirmInput = document.getElementById("restore-wallet-password-confirm");

  const inputFile = document.getElementById("restore-json-file");
  const inputPassword = document.getElementById("json-password");

  const errorSeed = document.getElementById("seed-error");
  const errorJson = document.getElementById("json-error");

  const privateKeyOutput = document.getElementById("restored-private-key");
  const privateKeyBox = document.getElementById("private-key-result");
  const copyPrivateBtn = document.getElementById("copy-restored-private");

  const tabBtns = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll(".restore-section");

  let currentWalletData = null;

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      sections.forEach(section => {
        section.classList.toggle("hidden", section.id !== `tab-${tab}`);
      });

      errorSeed.classList.add("hidden");
      errorJson.classList.add("hidden");
      privateKeyBox.classList.add("hidden");
      privateKeyOutput.value = "";
      currentWalletData = null;
      confirmBtn.classList.remove("hidden");
      downloadBtn.classList.add("hidden");
    });
  });

  encryptToggle?.addEventListener("change", () => {
    passwordContainer.classList.toggle("hidden", !encryptToggle.checked);
  });

  inputFile?.addEventListener("change", () => {
    const pwdBox = document.getElementById("json-password-container");
    pwdBox.classList.toggle("hidden", inputFile.files.length === 0);
  });

  openBtn?.addEventListener("click", () => {
    modal.classList.remove("hidden");
    const modalContent = modal.querySelector(".modal-content");
    modalContent.classList.remove("fade-out");
    modalContent.classList.add("fade-in");
    errorSeed.classList.add("hidden");
    errorJson.classList.add("hidden");
    privateKeyBox.classList.add("hidden");
    privateKeyOutput.value = "";
    confirmBtn.classList.remove("hidden");
    downloadBtn.classList.add("hidden");
  });

  function closeRestoreModal() {
    const modalContent = modal.querySelector(".modal-content");
    modal.classList.add("no-blur");
    modalContent.classList.remove("fade-in");
    modalContent.classList.add("fade-out");

    setTimeout(() => {
      modal.classList.add("hidden");
      modal.classList.remove("no-blur");
      modalContent.classList.remove("fade-out");
    }, 300);
  }

  closeBtn?.addEventListener("click", closeRestoreModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeRestoreModal();
  });

  confirmBtn?.addEventListener("click", async () => {
    errorSeed.classList.add("hidden");
    errorJson.classList.add("hidden");
    privateKeyBox.classList.add("hidden");
    privateKeyOutput.value = "";
    currentWalletData = null;

    const activeTab = document.querySelector(".tab-btn.active")?.dataset.tab;
    if (!activeTab) return;

    try {
      if (activeTab === "seed") {
        const { generateKeyPairFromSeed, encryptPrivateKey } = await import('./utils/crypto.js');
        const phrase = inputSeed.value.trim();
        
        if (!window.bip39.validateMnemonic(phrase, window.wordlist)) {
            throw new Error("Invalid mnemonic");
          }
          
          const keys = await generateKeyPairFromSeed(phrase);
          

        if (encryptToggle.checked) {
          const pass1 = passwordInput.value.trim();
          const pass2 = passwordConfirmInput.value.trim();
          if (!pass1 || pass1 !== pass2) {
            errorSeed.textContent = "Please enter and confirm your password.";
            errorSeed.classList.remove("hidden");
            return;
          }

          const encrypted = await encryptPrivateKey(keys.privateKey, pass1);
          currentWalletData = {
            encrypted: encrypted.encrypted,
            iv: encrypted.iv,
            method: encrypted.method,
            publicKey: keys.publicKey
          };
        } else {
          currentWalletData = {
            publicKey: keys.publicKey,
            privateKey: keys.privateKey
          };
        }

        privateKeyOutput.value = keys.privateKey;
        privateKeyBox.classList.remove("hidden");
        confirmBtn.classList.add("hidden");
        downloadBtn.classList.remove("hidden");

      } else if (activeTab === "json") {
        const file = inputFile.files[0];
        if (!file) throw new Error("No file selected");

        const content = await file.text();
        const data = JSON.parse(content);
        let privateKey = data.privateKey;

        if (data.encrypted && inputPassword.value) {
          const { decryptPrivateKey } = await import('./utils/crypto.js');
          privateKey = await decryptPrivateKey(data.encrypted, inputPassword.value, data.iv);
        }

        if (!/^[0-9a-f]{64}$/i.test(privateKey)) throw new Error("Invalid private key");

        privateKeyOutput.value = privateKey;
        privateKeyBox.classList.remove("hidden");
      }
    } catch (err) {
      console.warn("❌ Wallet restore error:", err);
      if (activeTab === "seed") errorSeed.classList.remove("hidden");
      if (activeTab === "json") errorJson.classList.remove("hidden");
    }
  });

  downloadBtn?.addEventListener("click", () => {
    if (!currentWalletData) return;
    downloadJSON(currentWalletData, "oridium-wallet.json");
  });

  copyPrivateBtn?.addEventListener("click", () => {
    if (!privateKeyOutput.value) return;
    navigator.clipboard.writeText(privateKeyOutput.value);
    copyPrivateBtn.innerText = "Copied!";
    setTimeout(() => (copyPrivateBtn.innerText = "Copy"), 1500);
  });

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
});