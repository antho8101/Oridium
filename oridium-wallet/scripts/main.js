import { analyzeIncomingBlocks } from './incoming-transactions.js';
import { getConnectedWalletAddress } from './wallet-session.js';
import { updateTransactionHistory } from './transaction-history.js';
import { getTransactionsForWallet } from './helpers/getTransactionsForWallet.js';

// 🔁 Check toutes les 3 secondes
setInterval(() => {
  const chain = window.blockchain; // récupère ta vraie blockchain ici
  const myAddress = getConnectedWalletAddress();

  if (chain && myAddress) {
    // 📩 Analyse les blocs pour déclencher les alertes
    analyzeIncomingBlocks(chain, myAddress);

    // 🧾 Met à jour l'historique des transactions
    const myTransactions = getTransactionsForWallet(chain, myAddress);
    updateTransactionHistory(myTransactions, myAddress);
  }
}, 3000);