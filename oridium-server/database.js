// database.js
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// 📦 Initialise la base
const DB_PATH = path.resolve('./database.sqlite');
const db = new Database(DB_PATH);

// 🧱 Création de la table blocks si elle n'existe pas
db.exec(`
  CREATE TABLE IF NOT EXISTS blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "index" INTEGER,
    timestamp INTEGER,
    transactions TEXT,
    previousHash TEXT,
    hash TEXT,
    nonce INTEGER
  );
`);

// ➕ Ajouter un bloc
export function addBlockToDB(block) {
  // 🔁 Récupère l'index le plus élevé
  const lastIndexRow = db.prepare('SELECT MAX("index") AS max FROM blocks').get();
  const index = (lastIndexRow?.max ?? -1) + 1;

  const stmt = db.prepare(`
    INSERT INTO blocks ("index", timestamp, transactions, previousHash, hash, nonce)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    index,
    block.timestamp,
    JSON.stringify(block.transactions || []),
    block.previousHash,
    block.hash,
    block.nonce
  );
}

// 🔄 Obtenir toute la blockchain
export function getBlockchainFromDB() {
  const rows = db.prepare('SELECT * FROM blocks ORDER BY "index" ASC').all();
  return rows.map(row => ({
    index: row.index,
    timestamp: row.timestamp,
    transactions: JSON.parse(row.transactions),
    previousHash: row.previousHash,
    hash: row.hash,
    nonce: row.nonce
  }));
}

// 💰 Calculer le solde d'une adresse
export function getBalanceFromDB(address) {
  const rows = db.prepare('SELECT transactions FROM blocks').all();
  let balance = 0;

  for (const row of rows) {
    const txs = JSON.parse(row.transactions || "[]");
    for (const tx of txs) {
      if (tx.sender === address) balance -= tx.amount;
      if (tx.receiver === address) balance += tx.amount;
    }
  }

  return balance;
}