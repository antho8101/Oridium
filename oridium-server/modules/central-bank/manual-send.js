// modules/central-bank/manual-send.js
import { withdraw } from './stock.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const historyPath = path.join(__dirname, '../../data/history.json');

/**
 * Envoie des ORID manuellement (admin)
 * @param {string} wallet - Wallet destinataire
 * @param {number} amount - Montant à envoyer
 */
export function manualSend(wallet, amount) {
  if (!wallet || typeof amount !== 'number' || amount <= 0) {
    throw new Error("Invalid parameters");
  }

  const stock = withdraw(amount); // met à jour stock.json
  console.log(`📤 ${amount} ORID envoyés à ${wallet} manuellement.`);

  // Enregistre dans l’historique (comme une vente mais manuelle)
  let history = [];
  if (fs.existsSync(historyPath)) {
    const raw = fs.readFileSync(historyPath, 'utf-8').trim();
    if (raw) history = JSON.parse(raw);
  }

  history.push({
    timestamp: new Date().toISOString(),
    wallet,
    amount,
    method: "manual"
  });

  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  console.log("📝 Enregistrement ajouté à history.json");
}