// send-publickey.js

import { getConnectedWalletAddress } from "../wallet-session.js";

// DOM Elements
const sendPublicKeyModal = document.getElementById("send-publickey-modal");
const sendPublicKeyContent = sendPublicKeyModal?.querySelector(".modal-content");

const copyKeyBtn = document.getElementById("copy-key-btn");
const modalPublicKeyInput = document.getElementById("modal-public-key");
const closeSendPublicKeyBtn = document.getElementById("close-sendkey-modal");

export function openSendPublicKeyModal() {
  const address = getConnectedWalletAddress();

  if (!address) {
    alert("You must connect your wallet to share your public key.");
    return;
  }

  modalPublicKeyInput.value = address;

  // Animation + ouverture
  sendPublicKeyModal.classList.remove("hidden");
  sendPublicKeyModal.classList.remove("no-blur");
  sendPublicKeyContent.classList.remove("fade-out");
  sendPublicKeyContent.classList.add("fade-in");
}

// Fermer la modale avec animation (comme wallet-modal)
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

// Attacher l'événement au bouton une fois le DOM chargé
document.addEventListener("DOMContentLoaded", () => {
  const triggerBtn = document.getElementById("open-sendkey-btn");
  if (triggerBtn) {
    triggerBtn.addEventListener("click", openSendPublicKeyModal);
  }
});
