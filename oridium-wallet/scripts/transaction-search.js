// scripts/transaction-search.js

const searchInputSelector = '.search-input';
const transactionListSelector = '.transaction-list';
const transactionDaySelector = '.transaction-day';
const transactionSpacerSelector = '.transaction-spacer';

let searchInput; // global pour l'utiliser partout

export function resetSearchInput() {
  const oldInput = document.querySelector(searchInputSelector);
  if (!oldInput) return;

  const parent = oldInput.parentNode;
  const newInput = document.createElement('input');

  newInput.type = 'text';
  newInput.className = 'search-input';
  newInput.placeholder = 'Search a transaction';
  newInput.setAttribute('autocomplete', 'off');
  newInput.setAttribute('name', 'no-autocomplete-' + Date.now());

  parent.replaceChild(newInput, oldInput);

  searchInput = newInput;
}

export function initTransactionSearch() {
    const transactionList = document.querySelector('.transaction-list');
    if (!transactionList) return;
  
    const noTransactionMessage = document.createElement('div');
    noTransactionMessage.className = 'no-transaction-found';
    noTransactionMessage.textContent = 'No transaction found';
    noTransactionMessage.style.display = 'none';
    transactionList.appendChild(noTransactionMessage);
  
    if (!searchInput) {
      searchInput = document.querySelector('.search-input');
    }
    if (!searchInput) return;
  
    searchInput.addEventListener('input', () => {
      const searchValue = searchInput.value.toLowerCase();
      let anyVisible = false;
  
      // D'abord on traite toutes les lignes
      document.querySelectorAll('.transaction-row').forEach(row => {
        const desc = row.querySelector('.transaction-desc')?.textContent.toLowerCase() || '';
        if (desc.includes(searchValue)) {
          row.style.display = 'flex';
        } else {
          row.style.display = 'none';
        }
      });
  
      // Ensuite, on gère les groupes par jour
      document.querySelectorAll('.transaction-day').forEach(day => {
        const visibleRows = day.querySelectorAll('.transaction-row:not([style*="display: none"])');
        if (visibleRows.length > 0) {
          day.style.display = 'flex';
          anyVisible = true;
        } else {
          day.style.display = 'none';
        }
      });
  
      // Puis on gère les spacers (séparateurs)
      document.querySelectorAll('.transaction-spacer').forEach(spacer => {
        const nextDay = spacer.nextElementSibling;
        if (nextDay && nextDay.style.display !== 'none') {
          spacer.style.display = 'block';
        } else {
          spacer.style.display = 'none';
        }
      });
  
      // Enfin, le message "No transaction found"
      noTransactionMessage.style.display = anyVisible ? 'none' : 'block';
    });
  }  