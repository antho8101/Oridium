// server.js
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

import {
  getBlockchainFromDB,
  addBlockToDB,
  getBalanceFromDB
} from './database.js';

import { adjustPrice } from './modules/central-bank/pricing-adjustment.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const blockchainPath = path.join('./data/blockchain.json');

// 🛡️ Restaurer automatiquement la blockchain depuis Gist si absente ou vide
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

// ✅ CORS CONFIGURATION (placée AVANT les routes)
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

// ✅ ROUTES
app.use('/api/price-history', priceHistoryRoute);
app.use('/api/price', priceRoute);
app.use('/api/disconnect-session', disconnectSession);
app.use('/api/paddle-webhook', paddleWebhook);
app.use('/api', salesRoute);
app.use('/api/wallet-sync', walletSyncRoute);
app.use('/api/set-session', setSessionRoute);

// 🔒 Blacklist
const BLACKLIST = new Set(["0x000000000000000000000000000000000000dead"]);
function isBlacklisted(block) {
  const senders = (block.transactions || []).map(tx => tx.sender);
  return senders.some(sender => sender !== "System" && BLACKLIST.has(sender));
}

function isValidHashDifficulty(hash, difficulty = 4) {
  return hash.startsWith('0'.repeat(difficulty));
}

// 🔗 Blockchain routes
app.get('/blockchain', (req, res) => {
  try {
    const blockchain = getBlockchainFromDB();
    res.json(blockchain);
  } catch (err) {
    console.error('❌ Error fetching blockchain:', err);
    res.status(500).json({ error: 'Failed to fetch blockchain' });
  }
});

app.post('/batch-add-blocks', (req, res) => {
  const blocks = req.body;
  if (!Array.isArray(blocks)) return res.status(400).json({ error: 'Expected an array of blocks' });

  try {
    let blockchain = getBlockchainFromDB();
    const lastHash = blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : "0";

    if (blocks[0].previousHash !== lastHash) {
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
        const balance = getBalanceFromDB(sender);
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

      addBlockToDB(block);
      lastHash = rawBlock.hash;
      index++;
      console.log(`📦 Block ${block.index} added`);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Batch server error' });
  }
});

app.get('/balance/:address', (req, res) => {
  const { address } = req.params;
  if (BLACKLIST.has(address)) return res.status(403).json({ error: 'Address is blacklisted' });

  try {
    const balance = getBalanceFromDB(address);
    res.json({ address, balance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

app.post('/register-wallet', (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'Missing address' });
  if (BLACKLIST.has(address)) return res.status(403).json({ error: 'Address is blacklisted' });

  try {
    const blockchain = getBlockchainFromDB();
    const alreadyExists = blockchain.some(block =>
      (block.transactions || []).some(tx =>
        tx.sender === address || tx.receiver === address
      )
    );

    if (!alreadyExists) {
      console.warn(`⚠️ Wallet ${address} not found in chain. No block created (waiting for mining or import).`);
    }

    res.json({ success: true });
  } catch (err) {
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
    console.log(`📦 Block ${block.index} added`);
    res.json({ success: true });

  } catch (err) {
    console.error("❌ Error in /add-block:", err);
    res.status(500).json({ error: 'Add block server error' });
  }
});

// 🔍 Endpoint debug blockchain
app.get('/debug-blockchain', (req, res) => {
  try {
    const raw = fs.readFileSync(blockchainPath, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.send(raw);
  } catch (err) {
    res.status(500).json({ error: "Failed to read blockchain file" });
  }
});

// 🕒 Tâche cron : ajustement du prix toutes les 30 minutes
setInterval(() => {
  console.log("⏱️ Tâche automatique : adjustPrice() toutes les 30 min");
  adjustPrice();
}, 30 * 60 * 1000);

// ✅ Serveur lancé
app.listen(PORT, () => {
  console.log(`🚀 Oridium API running on PORT ${PORT}`);
});
