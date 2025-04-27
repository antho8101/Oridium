// scripts/transaction-builder.js

export function addTransaction(dateStr, description, amount) {
    const transactionList = document.querySelector('.transaction-list');
    if (!transactionList) return;
  
    let dayBlock = transactionList.querySelector(`[data-date="${dateStr}"]`);
  
    if (!dayBlock) {
      dayBlock = document.createElement('div');
      dayBlock.className = 'transaction-day';
      dayBlock.setAttribute('data-date', dateStr);
  
      const dateElement = document.createElement('div');
      dateElement.className = 'transaction-date';
      dateElement.textContent = formatDateDisplay(dateStr);
  
      const rowsContainer = document.createElement('div');
      rowsContainer.className = 'transaction-rows';
  
      dayBlock.appendChild(dateElement);
      dayBlock.appendChild(rowsContainer);
  
      if (transactionList.querySelector('.transaction-day')) {
        const spacer = document.createElement('div');
        spacer.className = 'transaction-spacer';
        transactionList.appendChild(spacer);
      }
  
      transactionList.appendChild(dayBlock);
    }
  
    const rowsContainer = dayBlock.querySelector('.transaction-rows');
    if (!rowsContainer) return;
  
    const existingRows = rowsContainer.querySelectorAll('.transaction-row').length;
    const row = document.createElement('div');
    row.className = existingRows % 2 === 1 ? 'transaction-row alt' : 'transaction-row';
  
    const descSpan = document.createElement('span');
    descSpan.className = 'transaction-desc';
    descSpan.textContent = description;
  
    const amountSpan = document.createElement('span');
    amountSpan.className = 'transaction-amount';
    amountSpan.textContent = amount;
  
    row.appendChild(descSpan);
    row.appendChild(amountSpan);
    rowsContainer.appendChild(row);
  }
  
  // 📅 Transforme 2025-04-26 ➔ 26/04/2025
  export function formatDateDisplay(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }
  
  // 📅 Transforme timestamp ➔ 2025-04-26
  export function formatDateISO(timestamp) {
    const date = new Date(timestamp);
    return date.toISOString().slice(0, 10);
  }
  
  window.addTransaction = addTransaction;  