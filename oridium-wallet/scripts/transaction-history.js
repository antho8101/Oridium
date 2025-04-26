export function updateTransactionHistory(transactions, myAddress) {
  console.log("🧾 updateTransactionHistory()", { transactions, myAddress });
  
  const container = document.querySelector(".transaction-list");
  const placeholder = document.getElementById("no-transaction-placeholder");

  if (!container) {
    console.warn("⚠️ .transaction-list non trouvée");
    return;
  }

  // Si aucune transaction
  if (!transactions || transactions.length === 0) {
    if (placeholder) {
      placeholder.style.display = "block"; // Affiche le message
    }
    return;
  }

  // Si transactions présentes
  if (placeholder) {
    placeholder.style.display = "none"; // Cache le message
  }

  // Nettoie les transactions existantes sans toucher au placeholder
  const existingRows = container.querySelectorAll(".transaction-row:not(#no-transaction-placeholder)");
  existingRows.forEach(row => row.remove());

  // Trie et affiche les transactions
  transactions.sort((a, b) => b.blockTimestamp - a.blockTimestamp);

  for (const tx of transactions) {
    const row = document.createElement("div");
    row.className = "transaction-row";

    const desc = document.createElement("span");
    desc.className = "transaction-desc text";

    const amount = document.createElement("span");
    amount.className = "transaction-amount text";

    const isSender = tx.sender?.toLowerCase() === myAddress.toLowerCase();
    const counterparty = isSender
      ? tx.receiverName || tx.receiver?.slice(0, 6) + "..."
      : tx.senderName || tx.sender?.slice(0, 6) + "...";
    const direction = isSender
      ? `You to ${counterparty}`
      : `${counterparty} to You`;

    desc.textContent = direction;
    amount.textContent = `${parseFloat(tx.amount).toFixed(4)} ($ORID)`;

    row.appendChild(desc);
    row.appendChild(amount);
    container.appendChild(row);
  }
}