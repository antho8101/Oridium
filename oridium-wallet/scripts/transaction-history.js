export function updateTransactionHistory(transactions, myAddress) {
    const container = document.querySelector(".transaction-list");
    if (!container) {
      console.warn("⚠️ .transaction-list non trouvée");
      return;
    }
  
    // Nettoie le contenu existant
    container.innerHTML = "";
  
    if (!transactions.length) {
      const emptyRow = document.createElement("div");
      emptyRow.className = "transaction-row";
      emptyRow.innerHTML = `<span class="transaction-desc text">No history yet.</span>`;
      container.appendChild(emptyRow);
      return;
    }
  
    // Trie les transactions du plus récent au plus ancien
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
  
      // 🕒 Affiche la date au survol
      desc.title = new Date(tx.blockTimestamp).toLocaleString();
  
      row.appendChild(desc);
      row.appendChild(amount);
      container.appendChild(row);
  
      // // 🎯 (Optionnel) Ajoute une animation légère
      // row.classList.add("highlight");
      // setTimeout(() => row.classList.remove("highlight"), 1000);
    }
  }  