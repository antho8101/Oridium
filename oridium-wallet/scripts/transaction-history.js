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

  // 🔄 Nettoyage : ne touche pas au champ de recherche ni au placeholder
  const days = container.querySelectorAll('.transaction-day, .transaction-spacer');
  days.forEach(day => day.remove());

  if (!transactions || transactions.length === 0) {
    if (placeholder) placeholder.style.display = "block";
    if (bottom) bottom.style.display = "none";
    return;
  }

  // 📋 Trie décroissant (plus récent en haut)
  transactions.sort((a, b) => b.blockTimestamp - a.blockTimestamp);

  let validTransactionCount = 0;

  for (const tx of transactions) {
    // 🛡️ Ignore les récompenses de mining (émises par "System")
    if (tx.sender?.toLowerCase() === "system") {
      continue;
    }

    const isSender = tx.sender?.toLowerCase() === myAddress?.toLowerCase();
    const isReceiver = tx.receiver?.toLowerCase() === myAddress?.toLowerCase();

    if (!isSender && !isReceiver) {
      continue; // 🛡️ Ignore si la transaction ne me concerne pas
    }

    let counterparty = "";

    if (isSender) {
      counterparty = tx.receiverName || shortenAddress(tx.receiver);
    } else if (isReceiver) {
      counterparty = tx.senderName || tx.pseudo || shortenAddress(tx.sender);
      // 🆕 Fallback propre pour afficher pseudo si présent
    }

    const direction = isSender
      ? `You to ${counterparty}`
      : `${counterparty} to You`;

    const formattedAmount = `${parseFloat(tx.amount).toFixed(4)} ($ORID)`;
    const transactionDate = formatDateISO(tx.blockTimestamp);

    addTransaction(transactionDate, direction, formattedAmount);

    validTransactionCount++;
  }

  // ✅ À la toute fin : affiche ou masque le placeholder
  if (validTransactionCount === 0) {
    if (placeholder) placeholder.style.display = "block";
    if (bottom) bottom.style.display = "none";
  } else {
    if (placeholder) placeholder.style.display = "none";
    if (bottom) bottom.style.display = "block";
  }
}

// 🔗 Utilitaire raccourci pour afficher l'adresse
function shortenAddress(address) {
  if (!address) return "";
  return address.slice(0, 6) + "...";
}

// 🧹 Pour pouvoir tester dans console
window.updateTransactionHistory = updateTransactionHistory;