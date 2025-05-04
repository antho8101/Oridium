// modules/central-bank/stripe-sales.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getStock, withdraw } from './stock.js';
import { adjustPrice } from './pricing-adjustment.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const historyPath = path.join(__dirname, '../../data/history.json');

/**
 * Enregistre une vente Stripe réussie et met à jour le système
 * @param {string} wallet - L'adresse du wallet acheteur
 * @param {number} amount - Le nombre d'ORID achetés
 * @returns {object} - Résultat de la transaction
 */
function registerStripeSale(wallet, amount) {
  try {
    const stock = getStock();

    if (amount <= 0) {
      return { success: false, error: "Invalid ORID amount." };
    }

    if (stock.available < amount) {
      return { success: false, error: "Not enough ORID in stock." };
    }

    // Retirer du stock
    withdraw(amount);

    // Ajouter à l'historique
    let history = [];
    if (fs.existsSync(historyPath)) {
      const raw = fs.readFileSync(historyPath, 'utf-8');
      if (raw.trim()) {
        history = JSON.parse(raw);
      }
    }

    history.push({
      timestamp: new Date().toISOString(),
      wallet,
      amount
    });

    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

    // Recalcul dynamique du prix
    adjustPrice();

    return { success: true, message: "Sale registered.", wallet, amount };
  } catch (err) {
    console.error("❌ Erreur lors de l'enregistrement de la vente :", err);
    return { success: false, error: "Internal error during Stripe sale registration." };
  }
}

export { registerStripeSale };