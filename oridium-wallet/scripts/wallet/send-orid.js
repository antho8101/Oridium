// scripts/send-orid.js

import { getConnectedWalletAddress } from "../wallet-session.js";
import { getBalance, updateBalanceDisplay } from "../orid-network.js";
import { updateTransactionHistory } from "../transaction-history.js";
import { getTransactionsForWallet } from "../helpers/getTransactionsForWallet.js";

const API_BASE = "https://oridium-production.up.railway.app";

// DOM
const step1Modal = document.getElementById("send-orid-step1-modal");
const step2Modal = document.getElementById("send-orid-step2-modal");
const step3Modal = document.getElementById("send-orid-step3-modal");
const step4Modal = document.getElementById("send-orid-step4-modal");

const recipientInput = document.getElementById("recipient-key");
const recipientError = document.getElementById("key-validation-msg");
const nextToStep2Btn = document.getElementById("next-to-step2");

const amountInput = document.getElementById("orid-amount");
const amountError = document.getElementById("amount-error-msg");
const balanceDisplay = document.getElementById("your-balance");
const nextToSummaryBtn = document.getElementById("next-to-summary");

const summaryAmount = document.getElementById("summary-amount");
const summaryRecipient = document.getElementById("summary-key");
const summarySender = document.getElementById("summary-sender");
const confirmationMsg = document.getElementById("confirmation-message");

// Secure SHA256
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Ouverture du premier écran
document.getElementById("open-send-orid-btn")?.addEventListener("click", () => {
  resetStep1();
  openModal(step1Modal);
});

recipientInput?.addEventListener("input", () => {
  const value = recipientInput.value.trim();
  const isValid = /^0x[a-fA-F0-9]{40}$/.test(value);
  recipientError.classList.toggle("hidden", isValid);
  nextToStep2Btn.disabled = !isValid;
});

nextToStep2Btn?.addEventListener("click", async () => {
  closeModal(step1Modal);
  const sender = getConnectedWalletAddress();
  if (!sender) return alert("Please connect your wallet first.");

  const balance = await getBalance(sender);
  balanceDisplay.textContent = `${balance.toFixed(4)} ORID`;
  amountInput.setAttribute("max", balance.toFixed(4));

  resetStep2();
  openModal(step2Modal);
});

nextToSummaryBtn?.addEventListener("click", () => {
  closeModal(step2Modal);

  const amount = amountInput.value;
  const recipient = recipientInput.value;
  const sender = getConnectedWalletAddress();

  summaryAmount.textContent = amount;
  summaryRecipient.textContent = recipient;
  summarySender.textContent = sender;

  openModal(step3Modal);
});

document.getElementById("confirm-send")?.addEventListener("click", async () => {
  closeModal(step3Modal);
  openModal(step4Modal);
  confirmationMsg.textContent = "⏳ Sending...";

  const sender = getConnectedWalletAddress();
  const receiver = summaryRecipient.textContent;
  const amount = parseFloat(summaryAmount.textContent);

  try {
    const res = await fetch(`${API_BASE}/blockchain`);
    const chain = await res.json();
    const lastBlock = chain[chain.length - 1];
    const previousHash = lastBlock?.hash || "0";
    const index = chain.length;
    const timestamp = Date.now();
    const pseudoEl = document.getElementById("welcome-user");
    const pseudo = pseudoEl && !pseudoEl.classList.contains("hidden")
      ? pseudoEl.textContent.replace("Welcome, ", "").trim()
      : "Anonymous";

    const transactions = [{ sender, receiver, amount, pseudo }];
    const rawData = `${index}${timestamp}${JSON.stringify(transactions)}${previousHash}`;
    const hash = await sha256(rawData);

    const block = {
      index,
      timestamp,
      transactions,
      previousHash,
      hash,
      nonce: 0
    };

    const postRes = await fetch(`${API_BASE}/add-block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(block)
    });

    const result = await postRes.json();

    if (result.success) {
      confirmationMsg.textContent = `✅ ${amount.toFixed(4)} ORID sent successfully from ${sender}`;
      updateBalanceDisplay();

      // 🧹 Cache le placeholder "no transaction yet"
      const noTx = document.getElementById("no-transaction-placeholder");
      if (noTx) noTx.style.display = "none";

      // 🧾 Recharge toute la blockchain et reconstruit proprement l'historique
      const updatedChain = await fetch(`${API_BASE}/blockchain`).then(r => r.json());
      const myTransactions = getTransactionsForWallet(updatedChain, sender);
      window.__oridTransactionList = myTransactions;
      updateTransactionHistory(myTransactions, sender);

    } else {
      confirmationMsg.textContent = "❌ Server error: " + (result.error || "Unknown error");
    }
  } catch (err) {
    confirmationMsg.textContent = "❌ Failed to contact server.";
    console.error("Send error:", err);
  }
});

amountInput?.addEventListener("input", () => {
  const entered = parseFloat(amountInput.value);
  const max = parseFloat(amountInput.getAttribute("max"));
  const isValid = !isNaN(entered) && entered > 0 && entered <= max;
  amountError.classList.toggle("hidden", isValid);
  nextToSummaryBtn.disabled = !isValid;
});

document.getElementById("back-to-step1")?.addEventListener("click", () => {
  closeModal(step2Modal);
  openModal(step1Modal);
});
document.getElementById("back-to-step2")?.addEventListener("click", () => {
  closeModal(step3Modal);
  openModal(step2Modal);
});

document.getElementById("close-send-orid-step1")?.addEventListener("click", () => closeModal(step1Modal));
document.getElementById("close-send-orid-step3")?.addEventListener("click", () => closeModal(step3Modal));
document.getElementById("close-send-orid-step4")?.addEventListener("click", () => closeModal(step4Modal));

[step1Modal, step2Modal, step3Modal, step4Modal].forEach(modal => {
  modal?.addEventListener("click", e => {
    if (e.target === modal) closeModal(modal);
  });
});

function resetStep1() {
  recipientInput.value = "";
  recipientError.classList.add("hidden");
  nextToStep2Btn.disabled = true;
}

function resetStep2() {
  amountInput.value = "";
  amountError.classList.add("hidden");
  nextToSummaryBtn.disabled = true;
}

function openModal(modal) {
  modal.classList.remove("hidden");
  modal.classList.remove("no-blur");
  modal.querySelector(".modal-content").classList.replace("fade-out", "fade-in");
}

function closeModal(modal) {
  modal.classList.add("no-blur");
  const content = modal.querySelector(".modal-content");
  content.classList.replace("fade-in", "fade-out");
  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("no-blur");
  }, 300);
}