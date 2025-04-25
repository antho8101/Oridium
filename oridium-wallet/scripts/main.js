import { analyzeIncomingBlocks } from './incoming-transactions.js';
import { getConnectedWalletAddress } from './wallet-session.js';

// 🔁 Check toutes les 3 secondes
setInterval(() => {
  const chain = window.blockchain; // ou récupère ta vraie chaîne ici
  const myAddress = getConnectedWalletAddress();

  if (chain && myAddress) {
    analyzeIncomingBlocks(chain, myAddress);
  }
}, 3000);
