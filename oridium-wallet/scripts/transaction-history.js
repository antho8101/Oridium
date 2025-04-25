export function updateTransactionHistory(transactions, myAddress) {
    console.log("🧾 updateTransactionHistory()", { transactions, myAddress });  
    const container = document.querySelector(".transaction-list");
    if (!container) {
      console.warn("⚠️ .transaction-list non trouvée");
      return;
    }
  
    // Nettoie le contenu existant
    container.innerHTML = "";
  
    // Si aucune transaction : on affiche un message
    if (!transactions || transactions.length === 0) {
      const empty = document.createElement("div");
      empty.className = "transaction-row";
      empty.innerHTML = `<span class="transaction-desc text">No transactions yet</span><span></span>`;
      container.appendChild(empty);
      return;
    }
  
    // Sinon : on trie et on affiche
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