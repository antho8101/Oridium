// modules/central-bank/regen-partielle.js
import { getStock, saveStock } from './stock.js';

const WEEKLY_TARGET = 250;

/**
 * Effectue une régénération partielle du stock :
 * - Complète jusqu'à 250 ORID si le stock est inférieur
 * - Ne fait rien si le stock est déjà complet
 */
function runRegenPartielle() {
  const stock = getStock();

  const missing = WEEKLY_TARGET - stock.available;

  if (missing <= 0) {
    console.log(`✅ Stock suffisant (${stock.available}/${WEEKLY_TARGET}) — aucune action nécessaire.`);
    return;
  }

  const newStock = {
    ...stock,
    available: WEEKLY_TARGET,
    generatedAt: new Date().toISOString()
  };

  saveStock(newStock);
  console.log(`🔁 Stock complété de ${missing} ORID → nouveau total : ${WEEKLY_TARGET}`);
}

// Si exécuté directement
if (process.argv[1].endsWith('regen-partielle.js')) {
  runRegenPartielle();
}

export { runRegenPartielle };