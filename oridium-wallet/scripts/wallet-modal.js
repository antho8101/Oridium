import { generateKeyPairFromSeed, encryptPrivateKey } from "./wallet-logic.js";

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

// Step 1: Toggle mot de passe
encryptToggle.addEventListener("change", () => {
  passwordContainer.classList.toggle("hidden", !encryptToggle.checked);
  passwordInput.classList.remove("input-error");
  confirmPasswordInput.classList.remove("input-error");
  passwordError.classList.add("hidden");
});

// Step 2: Affiche la modale
document.querySelector(".menu-btn").addEventListener("click", () => {
  modal.classList.remove("hidden");

  // Reset UI
  passwordContainer.classList.add("hidden");
  publicKeySection.classList.add("hidden");
  downloadBtn.classList.add("hidden");
  generateBtn.classList.remove("hidden");

  // Reset champs
  seedInput.value = "";
  passwordInput.value = "";
  confirmPasswordInput.value = "";
  publicKeyInput.value = "";
  encryptToggle.checked = false;
  currentKeys = null;

  // Reset erreurs
  seedError.classList.add("hidden");
  seedInput.classList.remove("input-error");
  passwordError.classList.add("hidden");
  passwordInput.classList.remove("input-error");
  confirmPasswordInput.classList.remove("input-error");
});

// Step 3: Générer wallet
generateBtn.addEventListener("click", () => {
  const seed = seedInput.value.trim();
  const password = passwordInput.value.trim();
  const confirm = confirmPasswordInput.value.trim();
  const useEncryption = encryptToggle.checked;

  let hasError = false;

  // Vérif seed
  if (!seed) {
    seedInput.classList.add("input-error");
    seedError.classList.remove("hidden");
    hasError = true;
  } else {
    seedInput.classList.remove("input-error");
    seedError.classList.add("hidden");
  }

  // Vérif mot de passe si checkbox cochée
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

  // Génère les clés
  currentKeys = generateKeyPairFromSeed(seed);
  publicKeyInput.value = currentKeys.publicKey;

  // UI
  publicKeySection.classList.remove("hidden");
  downloadBtn.classList.remove("hidden");
  generateBtn.classList.add("hidden");
});

// Step 4: Download wallet
downloadBtn.addEventListener("click", async () => {
  if (!currentKeys) return;

  const password = passwordInput.value.trim();
  const useEncryption = encryptToggle.checked && password;

  let content = { publicKey: currentKeys.publicKey };

  if (useEncryption) {
    const encrypted = await encryptPrivateKey(currentKeys.privateKey, password);
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

// Step 5: Copy public key
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(publicKeyInput.value);
  copyBtn.innerText = "Copied!";
  setTimeout(() => (copyBtn.innerText = "Copy"), 1500);
});

// Step 6: Fermer modale
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

// Click dehors = fermer
window.addEventListener("click", (e) => {
  if (e.target === modal) closeBtn.click();
});

// Seed automatique
document.getElementById("generate-seed").addEventListener("click", () => {
  const generatedSeed = generateRandomSeedPhrase();
  seedInput.value = generatedSeed;
});

function generateRandomSeedPhrase() {
  const words = [
    "sun", "moon", "orbit", "rocket", "dust", "crypto", "chain", "energy",
    "metal", "code", "hash", "block", "mine", "proof", "value", "secure"
  ];
  let phrase = [];
  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * words.length);
    phrase.push(words[index]);
  }
  return phrase.join(" ");
}