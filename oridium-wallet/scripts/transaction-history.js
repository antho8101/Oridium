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
  } else {
    if (placeholder) placeholder.style.display = "none";
    if (bottom) bottom.style.display = "block";
  }

  // 📋 Trie décroissant (plus récent en haut)
  transactions.sort((a, b) => b.blockTimestamp - a.blockTimestamp);

  for (const tx of transactions) {
    // 🛡️ Ignore les blocs qui ne sont pas des vraies transactions utilisateur
    if (!tx.pseudo) continue;

    const isSender = tx.sender?.toLowerCase() === myAddress?.toLowerCase();
    const counterparty = isSender
      ? tx.receiverName || shortenAddress(tx.receiver)
      : tx.senderName || shortenAddress(tx.sender);

    const direction = isSender
      ? `You to ${counterparty}`
      : `${counterparty} to You`;

    const formattedAmount = `${parseFloat(tx.amount).toFixed(4)} ($ORID)`;
    const transactionDate = formatDateISO(tx.blockTimestamp);

    addTransaction(transactionDate, direction, formattedAmount);
  }
}

// 🔗 Utilitaire raccourci pour afficher l'adresse
function shortenAddress(address) {
  if (!address) return "";
  return address.slice(0, 6) + "...";
}