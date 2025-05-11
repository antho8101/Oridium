// modules/central-bank/blockchain.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blockchainPath = path.join(__dirname, '../../data/blockchain.json');

// 📥 Charger la blockchain depuis le disque
export function getBlockchainFromDB() {
  if (!fs.existsSync(blockchainPath)) return [];
  const raw = fs.readFileSync(blockchainPath, 'utf-8').trim();
  return raw ? JSON.parse(raw) : [];
}

// 💾 Enregistrer toute la chaîne (écrasement)
function saveBlockchain(chain) {
  fs.writeFileSync(blockchainPath, JSON.stringify(chain, null, 2));
}

// ➕ Ajouter un bloc à la blockchain
export function addBlockToDB(block) {
  const chain = getBlockchainFromDB();

  // Vérification de l'intégrité du bloc
  const lastBlock = chain.length > 0 ? chain[chain.length - 1] : null;
  const expectedPrevHash = lastBlock ? lastBlock.hash : "0";

  if (block.previousHash !== expectedPrevHash) {
    throw new Error("Invalid previousHash");
  }

  if (!isValidHashDifficulty(block.hash, 4)) {
    throw new Error("Hash does not meet required difficulty");
  }

  chain.push(block);
  saveBlockchain(chain);
  console.log(`✅ Block #${block.index} enregistré`);
}

// 📊 Calcul du solde d’un wallet
export function getBalanceFromDB(address) {
  const chain = getBlockchainFromDB();
  let balance = 0;

  for (const block of chain) {
    for (const tx of block.transactions || []) {
      if (tx.sender === address) balance -= tx.amount;
      if (tx.receiver === address) balance += tx.amount;
    }
  }

  return balance;
}

// 🔐 Vérifie que le hash commence par X zéros
export function isValidHashDifficulty(hash, difficulty = 4) {
  return hash.startsWith('0'.repeat(difficulty));
}
