// oridium-wallet/scripts/utils/difficulty.js

// 🔧 MODE DEV
const DEV_MODE = true; // ⛏️ Change à false pour activer la vraie difficulté

export const GENESIS_TIMESTAMP = 1710000000; // Date de lancement
export const BASE_DIFFICULTY = 13;

export function getGlobalDifficulty() {
  if (DEV_MODE) return 3;

  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - GENESIS_TIMESTAMP;
  const steps = Math.floor(elapsed / 300); // +1 difficulté toutes les 5 min
  return BASE_DIFFICULTY + steps;
}