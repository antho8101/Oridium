// send-publickey.js

import { getConnectedWalletAddress } from "../wallet-session.js";

// DOM Elements
const sendPublicKeyModal = document.getElementById("send-publickey-modal");
const sendPublicKeyContent = sendPublicKeyModal?.querySelector(".modal-content");

const copyKeyBtn = document.getElementById("copy-key-btn");
const modalPublicKeyInput = document.getElementById("modal-public-key");
const closeSendPublicKeyBtn = document.getElementById("close-sendkey-modal");

// Fonction principale d'ouverture
export function openSendPublicKeyModal() {
  const address = getConnectedWalletAddress();

  if (!address) {
    alert("You must connect your wallet to share your public key.");
    return;
  }

  modalPublicKeyInput.value = address;

  sendPublicKeyModal.classList.remove("hidden");
  sendPublicKeyModal.classList.remove("no-blur");
  sendPublicKeyContent.classList.remove("fade-out");
  sendPublicKeyContent.classList.add("fade-in");
}

// Fermeture de la modale avec animation
function closeModal() {
  sendPublicKeyModal.classList.add("no-blur");
  sendPublicKeyContent.classList.remove("fade-in");
  sendPublicKeyContent.classList.add("fade-out");

  setTimeout(() => {
    sendPublicKeyModal.classList.add("hidden");
    sendPublicKeyModal.classList.remove("no-blur");
  }, 300);
}

closeSendPublicKeyBtn?.addEventListener("click", closeModal);
sendPublicKeyModal?.addEventListener("click", (e) => {
  if (e.target === sendPublicKeyModal) closeModal();
});

// Copier la clé
copyKeyBtn?.addEventListener("click", () => {
  modalPublicKeyInput.select();
  document.execCommand("copy");
  copyKeyBtn.textContent = "Copied!";
  setTimeout(() => (copyKeyBtn.textContent = "Copy"), 1500);
});

// Génère l’URL de partage selon le service
function getShareURL(service, address) {
  const encoded = encodeURIComponent(address);
  switch (service) {
    case "gmail":
      return `https://mail.google.com/mail/?view=cm&to=&body=Here is my Oridium public key: ${encoded}`;
    case "whatsapp":
      return `https://wa.me/?text=Here%20is%20my%20Oridium%20public%20key:%20${encoded}`;
    case "telegram":
      return `https://t.me/share/url?url=${encoded}&text=Here%20is%20my%20Oridium%20public%20key`;   
      case "qr":
        openQRModal(address);
        return null;      
    default:
      return null;
  }
}

// Gère le clic sur un bouton de partage
function handleShareClick(service) {
  const address = getConnectedWalletAddress();
  if (!address) return alert("Connect your wallet first!");

  const url = getShareURL(service, address);
  if (url) {
    window.open(url, "_blank");
  }
}

// Événements une fois le DOM chargé
document.addEventListener("DOMContentLoaded", () => {
  const triggerBtn = document.getElementById("open-sendkey-btn");
  if (triggerBtn) {
    triggerBtn.addEventListener("click", openSendPublicKeyModal);
  }

  document.getElementById("share-gmail")?.addEventListener("click", () => handleShareClick("gmail"));
  document.getElementById("share-whatsapp")?.addEventListener("click", () => handleShareClick("whatsapp"));
  document.getElementById("share-telegram")?.addEventListener("click", () => handleShareClick("telegram"));
  document.getElementById("share-messenger")?.addEventListener("click", () => handleShareClick("messenger"));
  document.getElementById("share-discord")?.addEventListener("click", () => handleShareClick("discord"));
  document.getElementById("share-qr")?.addEventListener("click", () => handleShareClick("qr"));
});

// QR Modal Elements
const qrModal = document.getElementById("qr-modal");
const qrContent = qrModal?.querySelector(".modal-content");
const qrContainer = document.getElementById("qr-code-display");
const closeQRBtn = document.getElementById("close-qr-modal");

// Ouvre la modale QR (et ferme l'autre)
function openQRModal(address) {
  // Ferme la modale de partage
  closeModal();

  // Reset l’affichage
  qrContainer.innerHTML = "";

  // Génère le QR dans un canvas
  QRCode.toCanvas(address, {
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  }, function (err, canvas) {
    if (err) {
      console.error("QR Error:", err);
      return;
    }
    qrContainer.appendChild(canvas);
  });

  // Affiche la modale
  qrModal.classList.remove("hidden");
  qrModal.classList.remove("no-blur");
  qrContent.classList.remove("fade-out");
  qrContent.classList.add("fade-in");
}

// Ferme la modale QR
function closeQRModal() {
  qrModal.classList.add("no-blur");
  qrContent.classList.remove("fade-in");
  qrContent.classList.add("fade-out");

  setTimeout(() => {
    qrModal.classList.add("hidden");
    qrModal.classList.remove("no-blur");
  }, 300);
}

// Gestion des clics
closeQRBtn?.addEventListener("click", closeQRModal);
qrModal?.addEventListener("click", (e) => {
  if (e.target === qrModal) closeQRModal();
});