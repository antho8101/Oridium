// scripts/incoming-transactions.js

import { showOridAlert } from './orid-alert.js';

export function analyzeIncomingBlocks(chain, walletAddress) {
  const lowerAddress = walletAddress.toLowerCase();
  const lastTs = parseInt(localStorage.getItem("orid_last_alert_ts") || "0");
  const lastAlertedHash = localStorage.getItem("orid_last_alert_hash");

  for (const block of chain) {
    if (block.timestamp <= lastTs) continue;
    if (block.hash === lastAlertedHash) continue;

    const hasIncoming = block.transactions.some(tx =>
      tx.receiver?.toLowerCase() === lowerAddress &&
      tx.sender?.toLowerCase() !== "system"
    );

    if (!hasIncoming) continue;

    for (const tx of block.transactions) {
      if (
        tx.receiver?.toLowerCase() === lowerAddress &&
        tx.sender?.toLowerCase() !== "system"
      ) {
        const pseudo = tx.pseudo || tx.sender?.slice(0, 6) + "..." || "Someone";

        console.log("📩 Transaction entrante détectée : ", tx);
        showOridAlert(pseudo, tx.amount, tx.receiver);

        localStorage.setItem("orid_last_alert_ts", block.timestamp.toString());
        localStorage.setItem("orid_last_alert_hash", block.hash);
        break; // une seule alerte par bloc
      }
    }
  }
}
