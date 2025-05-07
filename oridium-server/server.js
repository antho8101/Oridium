import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import setSessionRoute from './api/set-session.js';

import {
  getBlockchainFromDB,
  addBlockToDB,
  getBalanceFromDB
} from './database.js';

import paddleWebhook from './api/paddle-webhook.js';
import stockRoute from './api/stock.js';
import salesRoute from './api/sales.js';
import walletSyncRoute from './api/wallet-sync.js'; // ✅ AJOUTÉ ICI

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: 'https://www.getoridium.com',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));

// Routes API
app.use('/api/paddle-webhook', paddleWebhook);
app.use('/api/stock', stockRoute);
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

// 🧱 Blockchain routes
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
    let lastHash = blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : "0";
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
      const lastBlock = blockchain[blockchain.length - 1];
      const newBlock = {
        index: blockchain.length,
        timestamp: Date.now(),
        transactions: [],
        previousHash: lastBlock?.hash || "0",
        hash: "init",
        nonce: 0,
      };

      addBlockToDB(newBlock);
      console.log(`🆕 Wallet ${address} registered`);
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

app.listen(PORT, () => {
  console.log(`🚀 Oridium API running on PORT ${PORT}`);
});
