// scripts/transaction-search.js

const searchInputSelector = '.search-input';
const transactionListSelector = '.transaction-list';
const transactionRowSelector = '.transaction-row';
const transactionGroupSelector = '.transaction-group';

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
}

export function initTransactionSearch() {
  const transactionList = document.querySelector(transactionListSelector);
  if (!transactionList) return;

  const noTransactionMessage = document.createElement('div');
  noTransactionMessage.className = 'no-transaction-found';
  noTransactionMessage.textContent = 'No transaction found';
  noTransactionMessage.style.display = 'none';
  transactionList.appendChild(noTransactionMessage);

  function addSearchListener() {
    const searchInput = document.querySelector(searchInputSelector);
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      const searchValue = searchInput.value.toLowerCase();
      let anyVisible = false;

      document.querySelectorAll(transactionRowSelector).forEach(row => {
        const desc = row.querySelector('.transaction-desc')?.textContent.toLowerCase() || '';
        if (desc.includes(searchValue)) {
          row.style.display = 'flex';
          anyVisible = true;
        } else {
          row.style.display = 'none';
        }
      });

      document.querySelectorAll(transactionGroupSelector).forEach(group => {
        const visibleRows = group.querySelectorAll(`${transactionRowSelector}:not([style*="display: none"])`);
        group.style.display = visibleRows.length > 0 ? 'flex' : 'none';
      });

      noTransactionMessage.style.display = anyVisible ? 'none' : 'block';
    });
  }

  // Appelle ça après avoir reset le champ
  addSearchListener();
}