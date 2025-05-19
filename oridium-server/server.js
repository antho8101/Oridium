import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

import setSessionRoute from './api/set-session.js';
import walletSyncRoute from './api/wallet-sync.js';
import paddleWebhook from './api/paddle-webhook.js';
import salesRoute from './api/sales.js';
import disconnectSession from './api/disconnect-session.js';
import priceRoute from './api/price.js';
import priceHistoryRoute from './api/price-history.js';

import stockRoute from './api/stock.js';

import {
  initDatabase, // 👈 AJOUTÉ
  getBlockchainFromDB,
  addBlockToDB,
  getBalanceFromDB
} from './database.js';

import { adjustPrice } from './modules/central-bank/pricing-adjustment.js';

dotenv.config();

await initDatabase(); // 👈 AJOUTÉ ICI

const app = express();
const PORT = process.env.PORT || 3000;
const blockchainPath = path.join('./data/blockchain.json');

function saveBlockchainToDisk(chain) {
  try {
    fs.writeFileSync(blockchainPath, JSON.stringify(chain, null, 2));
    console.log("💾 Blockchain sauvegardée sur disque.");
  } catch (err) {
    console.error("❌ Erreur sauvegarde blockchain :", err.message);
  }
}

async function restoreBlockchainIfNeeded() {
  try {
    if (fs.existsSync(blockchainPath)) {
      const content = fs.readFileSync(blockchainPath, 'utf-8').trim();
      if (content && content !== '[]') {
        console.log("✅ Blockchain locale détectée");
        return;
      }
    }

    const GIST_ID = "b44f157d4ec982344bac9ff13f099462";
    const GITHUB_TOKEN = process.env.GIST_TOKEN;

    if (!GITHUB_TOKEN) {
      console.warn("⚠️ GIST_TOKEN manquant dans les variables d'environnement");
      return;
    }

    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json"
      }
    });

    const data = await res.json();
    const rawContent = data.files["blockchain.json"]?.content;

    if (rawContent) {
      fs.writeFileSync(blockchainPath, rawContent);
      console.log("📥 Blockchain restaurée depuis le Gist");
    } else {
      console.warn("⚠️ Aucune blockchain trouvée dans le Gist");
    }
  } catch (err) {
    console.error("❌ Erreur restauration blockchain :", err.message);
  }
}

await restoreBlockchainIfNeeded();

const allowedOrigins = [
  'https://www.getoridium.com',
  'https://wallet.getoridium.com',
  'https://central.getoridium.com',
  'https://api.getoridium.com',
  'http://localhost:3000',
  'https://oridium-website-c23t205iq-antho8101s-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ Rejected by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));

app.use('/api/price-history', priceHistoryRoute);
app.use('/api/price', priceRoute);
app.use('/api/disconnect-session', disconnectSession);
app.use('/api/paddle-webhook', paddleWebhook);
app.use('/api', salesRoute);
app.use('/api/wallet-sync', walletSyncRoute);
app.use('/api/set-session', setSessionRoute);
app.use('/api/stock', stockRoute);

const BLACKLIST = new Set(["0x000000000000000000000000000000000000dead"]);
function isBlacklisted(block) {
  const senders = (block.transactions || []).map(tx => tx.sender);
  return senders.some(sender => sender !== "System" && BLACKLIST.has(sender));
}

function isValidHashDifficulty(hash, difficulty = 4) {
  return hash.startsWith('0'.repeat(difficulty));
}

app.get('/blockchain', async (req, res) => {
  try {
    const blockchain = await getBlockchainFromDB();
    res.json(blockchain);
  } catch (err) {
    console.error('❌ Error fetching blockchain:', err);
    res.status(500).json({ error: 'Failed to fetch blockchain' });
  }
});

app.post('/batch-add-blocks', async (req, res) => {
  const blocks = req.body;
  if (!Array.isArray(blocks)) return res.status(400).json({ error: 'Expected an array of blocks' });

  try {
    console.log("📩 Reçu un batch de blocs :", JSON.stringify(blocks, null, 2));

    const blockchain = await getBlockchainFromDB(); // ✅ await ici
    console.log("🔎 Taille de la blockchain actuelle :", blockchain.length);

    let lastHash = blockchain.length > 0 ? blockchain[blockchain.length - 1]?.hash || "0" : "0";
    console.log("🔗 Hash attendu :", lastHash);
    console.log("🔗 Hash fourni :", blocks[0].previousHash);

    if (blockchain.length === 0 && blocks[0].previousHash === "0") {
      console.warn("⚠️ Blockchain vide, acceptation forcée du premier batch");
    } else if (blocks[0].previousHash !== lastHash) {
      return res.status(400).json({ error: 'Invalid previousHash. Chain fork detected.' });
    }

    let index = blockchain.length;

    for (const rawBlock of blocks) {
      if (isBlacklisted(rawBlock)) return res.status(403).json({ error: 'Sender in batch is blacklisted' });

      const txs = rawBlock.transactions || [];
      const totalBySender = {};
      for (const tx of txs) {
        if (tx.sender === "System") continue;
        totalBySender[tx.sender] = (totalBySender[tx.sender] || 0) + tx.amount;
      }

      for (const sender in totalBySender) {
        const balance = await getBalanceFromDB(sender);
        if (balance < totalBySender[sender]) return res.status(400).json({ error: `Insufficient balance for ${sender}` });
      }

      if (!isValidHashDifficulty(rawBlock.hash)) return res.status(400).json({ error: 'Invalid hash difficulty in batch' });

      const block = {
        index,
        timestamp: rawBlock.timestamp,
        transactions: txs,
        previousHash: lastHash,
        hash: rawBlock.hash,
        nonce: rawBlock.nonce
      };

      await addBlockToDB(block);
      lastHash = rawBlock.hash;
      index++;
      console.log(`📦 Block ${block.index} added`);
    }

    const updated = await getBlockchainFromDB();
    saveBlockchainToDisk(updated);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ ERREUR critique dans /batch-add-blocks :", err);
    res.status(500).json({ error: 'Batch server error' });
  }
});

app.get('/balance/:address', async (req, res) => {
  const { address } = req.params;
  if (BLACKLIST.has(address)) return res.status(403).json({ error: 'Address is blacklisted' });

  try {
    const balance = await getBalanceFromDB(address); // ✅ await ici
    res.json({ address, balance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

app.get('/history/:address', async (req, res) => {
  const { address } = req.params;

  try {
    const blockchain = await getBlockchainFromDB();
    const transactions = [];

    for (const block of blockchain) {
      for (const tx of block.transactions || []) {
        if (tx.sender === address || tx.receiver === address) {
          transactions.push({
            ...tx,
            blockTimestamp: block.timestamp,
            blockIndex: block.index
          });
        }
      }
    }

    res.json({ address, transactions });
  } catch (err) {
    console.error("❌ Failed to fetch transaction history:", err);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

app.post('/register-wallet', async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'Missing address' });
  if (BLACKLIST.has(address)) return res.status(403).json({ error: 'Address is blacklisted' });

  try {
    const blockchain = await getBlockchainFromDB(); // ✅ await ajouté
    const alreadyExists = blockchain.some(block =>
      (block.transactions || []).some(tx =>
        tx.sender?.toLowerCase() === address.toLowerCase() || tx.receiver?.toLowerCase() === address.toLowerCase()
      )
    );

    if (!alreadyExists) {
      console.warn(`⚠️ Wallet ${address} not found in chain. No block created (waiting for mining or import).`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to register wallet:", err.message);
    res.status(500).json({ error: 'Failed to register wallet' });
  }
});

app.post('/add-block', (req, res) => {
  const rawBlock = req.body;

  try {
    if (isBlacklisted(rawBlock)) return res.status(403).json({ error: 'Sender is blacklisted' });

    const txs = rawBlock.transactions || [];
    const totalBySender = {};
    for (const tx of txs) {
      if (tx.sender === "System") continue;
      totalBySender[tx.sender] = (totalBySender[tx.sender] || 0) + tx.amount;
    }

    for (const sender in totalBySender) {
      const balance = getBalanceFromDB(sender);
      if (balance < totalBySender[sender]) return res.status(400).json({ error: `Insufficient balance for ${sender}` });
    }

    const isFromSystem = txs.every(tx => tx.sender === "System");
    if (isFromSystem && !isValidHashDifficulty(rawBlock.hash)) return res.status(400).json({ error: 'Invalid hash difficulty' });

    const blockchain = getBlockchainFromDB();
    const lastHash = blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : "0";
    const index = blockchain.length;

    const block = {
      index,
      timestamp: rawBlock.timestamp,
      transactions: txs,
      previousHash: lastHash,
      hash: rawBlock.hash,
      nonce: rawBlock.nonce
    };

    addBlockToDB(block);
    saveBlockchainToDisk(getBlockchainFromDB());
    console.log(`📦 Block ${block.index} added`);
    res.json({ success: true });

  } catch (err) {
    console.error("❌ Error in /add-block:", err);
    res.status(500).json({ error: 'Add block server error' });
  }
});

app.get('/debug-blockchain', (req, res) => {
  try {
    const raw = fs.readFileSync(blockchainPath, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.send(raw);
  } catch (err) {
    res.status(500).json({ error: "Failed to read blockchain file" });
  }
});

app.get('/history/:address', async (req, res) => {
  const { address } = req.params;

  try {
    const blockchain = await getBlockchainFromDB();
    const transactions = [];

    for (const block of blockchain) {
      for (const tx of block.transactions || []) {
        if (tx.sender === address || tx.receiver === address) {
          transactions.push({
            ...tx,
            blockTimestamp: block.timestamp,
            blockIndex: block.index
          });
        }
      }
    }

    res.json({ address, transactions });
  } catch (err) {
    console.error("❌ Failed to fetch transaction history:", err);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

setInterval(() => {
  console.log("⏱️ Tâche automatique : adjustPrice() toutes les 30 min");
  adjustPrice();
}, 30 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`🚀 Oridium API running on PORT ${PORT}`);
});