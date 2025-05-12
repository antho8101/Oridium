// database.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI; // 👉 mets ton URI dans .env
const client = new MongoClient(uri);
const dbName = 'oridium';
const collectionName = 'blocks';

let db, blocks;

export async function initDatabase() {
  try {
    await client.connect();
    db = client.db(dbName);
    blocks = db.collection(collectionName);
    console.log("📦 MongoDB connecté et prêt !");
  } catch (err) {
    console.error("❌ Connexion MongoDB échouée :", err);
  }
}

// ➕ Ajouter un bloc
export async function addBlockToDB(block) {
  const last = await blocks.find().sort({ index: -1 }).limit(1).toArray();
  const nextIndex = last.length > 0 ? last[0].index + 1 : 0;
  await blocks.insertOne({ ...block, index: nextIndex });
}

// 🔄 Obtenir toute la blockchain
export async function getBlockchainFromDB() {
  return await blocks.find().sort({ index: 1 }).toArray();
}

// 💰 Calculer le solde d'une adresse
export async function getBalanceFromDB(address) {
  const allBlocks = await blocks.find().toArray();
  let balance = 0;

  for (const block of allBlocks) {
    for (const tx of block.transactions || []) {
      if (tx.sender === address) balance -= tx.amount;
      if (tx.receiver === address) balance += tx.amount;
    }
  }

  return balance;
}