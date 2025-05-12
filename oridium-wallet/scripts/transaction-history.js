// scripts/transaction-history.js

import { addTransaction, formatDateISO } from './transaction-builder.js';

export function updateTransactionHistory(transactions, myAddress) {
  console.log("🧾 updateTransactionHistory()", { transactions, myAddress });

  const container = document.querySelector(".transaction-list");
  const bottom = document.querySelector(".transaction-bottom");
  const placeholder = document.getElementById("no-transaction-placeholder");

  if (!container) {
    console.warn("⚠️ .transaction-list non trouvée");
    return;
  }

  // 🔄 Nettoyage visuel
  const days = container.querySelectorAll('.transaction-day, .transaction-spacer');
  days.forEach(day => day.remove());

  // 📋 Trie décroissant
  transactions.sort((a, b) => b.blockTimestamp - a.blockTimestamp);

  for (const tx of transactions) {
    if (tx.sender?.toLowerCase() === "system") continue;

    const isSender = tx.sender?.toLowerCase() === myAddress?.toLowerCase();
    const isReceiver = tx.receiver?.toLowerCase() === myAddress?.toLowerCase();
    if (!isSender && !isReceiver) continue;

    let counterparty = "";

    if (isSender) {
      counterparty = tx.receiverName || shortenAddress(tx.receiver);
    } else if (isReceiver) {
      counterparty = tx.senderName || tx.pseudo || shortenAddress(tx.sender);
    }

    const direction = isSender
      ? `You to ${counterparty}`
      : `${counterparty} to You`;

    const formattedAmount = `${parseFloat(tx.amount).toFixed(4)} ($ORID)`;
    const transactionDate = formatDateISO(tx.blockTimestamp);

    addTransaction(transactionDate, direction, formattedAmount);
  }

  // ✅ FINAL : Vérifie s'il y a vraiment des transactions
  const hasTransactions = container.querySelector('.transaction-day');

  if (hasTransactions) {
    if (placeholder) placeholder.style.display = "none";
    if (bottom) bottom.style.display = "block";
  } else {
    if (placeholder) placeholder.style.display = "block";
    if (bottom) bottom.style.display = "none";
  }
}

export async function fetchTransactionHistory(address) {
  try {
    const res = await fetch(`https://api.getoridium.com/history/${address}`);
    const data = await res.json();
    return Array.isArray(data.transactions) ? data.transactions : [];
  } catch (err) {
    console.error("❌ Failed to fetch transaction history from server:", err);
    return [];
  }
}

// 🔗 Utilitaire pour raccourcir une adresse
function shortenAddress(address) {
  if (!address) return "";
  return address.slice(0, 6) + "...";
}

// 🧹 Pour pouvoir appeler updateTransactionHistory depuis la console
window.updateTransactionHistory = updateTransactionHistory;
window.fetchTransactionHistory = fetchTransactionHistory;
