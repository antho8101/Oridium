const mnemonic = window.bip39.generateMnemonic();
const isValid = window.bip39.validateMnemonic(mnemonic);

document.addEventListener("DOMContentLoaded", () => {
  try {
    const modal = document.getElementById("wallet-modal");
    const publicKeyInput = document.getElementById("public-key");
    const seedInput = document.getElementById("seed-phrase");
    const encryptToggle = document.getElementById("encrypt-toggle");
    const passwordContainer = document.getElementById("password-container");
    const passwordInput = document.getElementById("wallet-password");
    const confirmPasswordInput = document.getElementById("wallet-password-confirm");
    const passwordError = document.getElementById("password-error");
    const seedError = document.getElementById("seed-error");

    const downloadBtn = document.getElementById("download-wallet");
    const closeBtn = document.getElementById("close-wallet-modal");
    const generateBtn = document.getElementById("generate-wallet");
    const copyBtn = document.getElementById("copy-public");
    const publicKeySection = publicKeyInput.closest(".key-display");

    let currentKeys = null;

    // 🔐 Génération de la seed phrase via bip-39-loader
    document.getElementById("generate-seed").addEventListener("click", () => {
      const generatedSeed = window.bip39.generateMnemonic();
      seedInput.value = generatedSeed;
      console.log("Generated mnemonic:", generatedSeed);
    });

    encryptToggle.addEventListener("change", () => {
      passwordContainer.classList.toggle("hidden", !encryptToggle.checked);
      passwordInput.classList.remove("input-error");
      confirmPasswordInput.classList.remove("input-error");
      passwordError.classList.add("hidden");
    });

    document.querySelector(".menu-btn").addEventListener("click", () => {
      modal.classList.remove("hidden");

      passwordContainer.classList.add("hidden");
      publicKeySection.classList.add("hidden");
      downloadBtn.classList.add("hidden");
      generateBtn.classList.remove("hidden");

      seedInput.value = "";
      passwordInput.value = "";
      confirmPasswordInput.value = "";
      publicKeyInput.value = "";
      encryptToggle.checked = false;
      currentKeys = null;

      seedError.classList.add("hidden");
      seedInput.classList.remove("input-error");
      passwordError.classList.add("hidden");
      passwordInput.classList.remove("input-error");
      confirmPasswordInput.classList.remove("input-error");
    });

    generateBtn.addEventListener("click", async () => {
      const seed = seedInput.value.trim();
      const password = passwordInput.value.trim();
      const confirm = confirmPasswordInput.value.trim();
      const useEncryption = encryptToggle.checked;

      let hasError = false;

      // ✅ Validation de la seed via bip-39-loader
      if (!seed || !validateMnemonic(seed)) {
        seedInput.classList.add("input-error");
        seedError.classList.remove("hidden");
        hasError = true;
      } else {
        seedInput.classList.remove("input-error");
        seedError.classList.add("hidden");
      }

      if (useEncryption) {
        if (!password || !confirm) {
          passwordInput.classList.add("input-error");
          confirmPasswordInput.classList.add("input-error");
          passwordError.textContent = "Please fill both password fields.";
          passwordError.classList.remove("hidden");
          hasError = true;
        } else if (password !== confirm) {
          passwordInput.classList.add("input-error");
          confirmPasswordInput.classList.add("input-error");
          passwordError.textContent = "Passwords do not match.";
          passwordError.classList.remove("hidden");
          hasError = true;
        } else {
          passwordInput.classList.remove("input-error");
          confirmPasswordInput.classList.remove("input-error");
          passwordError.classList.add("hidden");
        }
      }

      if (hasError) return;

      currentKeys = await window.generateKeyPairFromSeed(seed);
      publicKeyInput.value = currentKeys.publicKey;

      publicKeySection.classList.remove("hidden");
      downloadBtn.classList.remove("hidden");
      generateBtn.classList.add("hidden");
    });

    downloadBtn.addEventListener("click", async () => {
      if (!currentKeys) return;

      const password = passwordInput.value.trim();
      const useEncryption = encryptToggle.checked && password;

      let content = { publicKey: currentKeys.publicKey };

      if (useEncryption) {
        const encrypted = await window.encryptPrivateKey(currentKeys.privateKey, password);
        content = {
          ...content,
          privateKeyEncrypted: encrypted.encrypted,
          iv: encrypted.iv,
          method: "AES-GCM",
        };
      } else {
        content.privateKey = currentKeys.privateKey;
      }

      const blob = new Blob([JSON.stringify(content, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "oridium-wallet.json";
      a.click();
      URL.revokeObjectURL(url);
    });

    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(publicKeyInput.value);
      copyBtn.innerText = "Copied!";
      setTimeout(() => (copyBtn.innerText = "Copy"), 1500);
    });

    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
      seedInput.value = "";
      passwordInput.value = "";
      confirmPasswordInput.value = "";
      publicKeyInput.value = "";
      encryptToggle.checked = false;
      passwordContainer.classList.add("hidden");
      publicKeySection.classList.add("hidden");
      downloadBtn.classList.add("hidden");
      generateBtn.classList.remove("hidden");
      currentKeys = null;

      seedError.classList.add("hidden");
      passwordError.classList.add("hidden");
      seedInput.classList.remove("input-error");
      passwordInput.classList.remove("input-error");
      confirmPasswordInput.classList.remove("input-error");
    });

  } catch (e) {
    console.error("Wallet modal init error:", e);
  }
});