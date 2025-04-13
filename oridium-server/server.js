// server.js

import express from 'express';
import cors from 'cors';
import {
  getBlockchainFromDB,
  addBlockToDB,
  getBalanceFromDB
} from './database.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔍 GET /blockchain
app.get('/blockchain', (req, res) => {
  try {
    const blockchain = getBlockchainFromDB();
    res.json(blockchain);
  } catch (err) {
    console.error('❌ Error fetching blockchain:', err);
    res.status(500).json({ error: 'Failed to fetch blockchain' });
  }
});

// ➕ POST /add-block
app.post('/add-block', (req, res) => {
  const block = req.body;

  if (!block || typeof block !== 'object') {
    return res.status(400).json({ error: 'Invalid block format' });
  }

  try {
    const txs = block.transactions || [];

    for (const tx of txs) {
      if (tx.sender !== "System") {
        const senderBalance = getBalanceFromDB(tx.sender);
        if (senderBalance < tx.amount) {
          return res.status(400).json({
            error: `Insufficient balance for sender ${tx.sender}`
          });
        }
      }
    }

    addBlockToDB(block);
    console.log(`🧱 Block ${block.index} added`);
    res.json({ success: true });

  } catch (err) {
    console.error("❌ Error in /add-block:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 💰 GET /balance/:address
app.get('/balance/:address', (req, res) => {
  const { address } = req.params;

  try {
    const balance = getBalanceFromDB(address);
    res.json({ address, balance });
  } catch (err) {
    console.error("❌ Error in /balance:", err);
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

// 🆕 POST /register-wallet
app.post('/register-wallet', (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'Missing address' });

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
    console.error("❌ Error in /register-wallet:", err);
    res.status(500).json({ error: 'Failed to register wallet' });
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Oridium API running on PORT ${PORT}`);
});