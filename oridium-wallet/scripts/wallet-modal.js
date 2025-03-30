import { generateKeyPairFromSeed, encryptPrivateKey } from "./wallet-logic.js";

const modal = document.getElementById("wallet-modal");
const publicKeyInput = document.getElementById("public-key");
const seedInput = document.getElementById("seed-phrase");
const encryptToggle = document.getElementById("encrypt-toggle");
const passwordContainer = document.getElementById("password-container");
const passwordInput = document.getElementById("wallet-password");
const downloadBtn = document.getElementById("download-wallet");
const closeBtn = document.getElementById("close-wallet-modal");
const generateBtn = document.getElementById("generate-wallet");

let currentKeys = null;

// Afficher ou masquer le champ mot de passe
encryptToggle.addEventListener("change", () => {
  passwordContainer.classList.toggle("hidden", !encryptToggle.checked);
});

// Ouvrir la modale depuis le menu
document.querySelector(".menu-btn").addEventListener("click", () => {
  modal.classList.remove("hidden");
});

// Générer les clés depuis le seed (après clic dans la modale)
generateBtn.addEventListener("click", () => {
    const seed = seedInput.value.trim();
    const errorMsg = document.getElementById("seed-error");
  
    if (!seed) {
      errorMsg.classList.remove("hidden");
      seedInput.classList.add("input-error");
      return;
    }
  
    errorMsg.classList.add("hidden");
    seedInput.classList.remove("input-error");
  
    currentKeys = generateKeyPairFromSeed(seed);
    publicKeyInput.value = currentKeys.publicKey;
  });  

// Télécharger le fichier wallet
downloadBtn.addEventListener("click", async () => {
  if (!currentKeys) return;

  const password = passwordInput.value;
  const shouldEncrypt = encryptToggle.checked && password;

  let content = {
    publicKey: currentKeys.publicKey
  };

  if (shouldEncrypt) {
    const { encrypted, iv } = await encryptPrivateKey(currentKeys.privateKey, password);
    content.privateKeyEncrypted = encrypted;
    content.iv = iv;
    content.method = "AES-GCM";
  } else {
    content.privateKey = currentKeys.privateKey;
  }

  const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "oridium-wallet.json";
  a.click();
  URL.revokeObjectURL(url);

  closeBtn.click(); // Fermer la modale après export
});

// Fermer la modale
closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  seedInput.value = "";
  passwordInput.value = "";
  encryptToggle.checked = false;
  passwordContainer.classList.add("hidden");
  publicKeyInput.value = "";
  currentKeys = null;
});

// Fermer la modale si clic à l’extérieur
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeBtn.click();
  }
});