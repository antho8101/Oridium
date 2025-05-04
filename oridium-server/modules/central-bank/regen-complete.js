// modules/central-bank/regen-complete.js
import { resetStock } from './stock.js';

// 👇 Tu peux modifier ce chiffre selon les besoins
const DEFAULT_WEEKLY_QUOTA = 250;

function runRegenComplete() {
  const stock = resetStock(DEFAULT_WEEKLY_QUOTA);
  console.log("✅ Stock réinitialisé avec succès :", stock);
}

// Si exécuté en ligne de commande directement
if (process.argv[1].endsWith('regen-complete.js')) {
  runRegenComplete();
}

export { runRegenComplete };