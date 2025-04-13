import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import {
  getBlockchainFromDB,
  addBlockToDB,
  getBalanceFromDB
} from './database.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// 🚫 Blacklist
const BLACKLIST = new Set([
  "0x000000000000000000000000000000000000dead", // Exemple
]);

function isBlacklisted(block) {
  const senders = (block.transactions || []).map(tx => tx.sender);
  return senders.some(sender => sender !== "System" && BLACKLIST.has(sender));
}

// 🔒 Recalcul du hash
function calculateHash(index, timestamp, transactions, previousHash, nonce) {
  const data = `${index}${timestamp}${JSON.stringify(transactions)}${previousHash}${nonce}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

// ✅ Vérifie la difficulté (4 zéros en début de hash pour test)
function isValidHashDifficulty(hash, difficulty = 4) {
  return hash.startsWith('0'.repeat(difficulty));
}

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
app.post('/batch-add-blocks', (req, res) => {
  const blocks = req.body;

  console.log("📥 Received batch:", blocks);

  if (!Array.isArray(blocks)) {
    return res.status(400).json({ error: 'Expected an array of blocks' });
  }

  try {
    let blockchain = getBlockchainFromDB();
    let lastHash = blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : "0";
    let index = blockchain.length;

    for (const rawBlock of blocks) {
      const txs = rawBlock.transactions || [];

      const totalBySender = {};
      for (const tx of txs) {
        if (tx.sender === "System") continue;
        if (!totalBySender[tx.sender]) totalBySender[tx.sender] = 0;
        totalBySender[tx.sender] += tx.amount;
      }

      for (const sender in totalBySender) {
        const balance = getBalanceFromDB(sender);
        if (balance < totalBySender[sender]) {
          console.warn("❌ Balance too low:", sender, "has", balance, "needs", totalBySender[sender]);
          return res.status(400).json({
            error: `Insufficient balance for ${sender}`
          });
        }
      }

      const recalculated = calculateHash(
        rawBlock.index,
        rawBlock.timestamp,
        txs,
        lastHash,
        rawBlock.nonce
      );

      if (recalculated !== rawBlock.hash) {
        console.warn("❌ Hash mismatch:", {
          expected: recalculated,
          received: rawBlock.hash
        });
        return res.status(400).json({ error: 'Hash mismatch in batch' });
      }

      if (!isValidHashDifficulty(recalculated)) {
        console.warn("❌ Invalid difficulty:", recalculated);
        return res.status(400).json({ error: 'Invalid hash difficulty in batch' });
      }

      const block = {
        index: rawBlock.index,
        timestamp: rawBlock.timestamp,
        transactions: txs,
        previousHash: lastHash,
        hash: recalculated,
        nonce: rawBlock.nonce
      };

      addBlockToDB(block);
      lastHash = recalculated;
      index++;
      console.log(`📦 Block ${block.index} added`);
    }

    res.json({ success: true });

  } catch (err) {
    console.error("❌ Error in /batch-add-blocks:", err);
    res.status(500).json({ error: 'Batch server error' });
  }
});

// 🔁 POST /batch-add-blocks
app.post('/batch-add-blocks', (req, res) => {
  const blocks = req.body;

  if (!Array.isArray(blocks)) {
    return res.status(400).json({ error: 'Expected an array of blocks' });
  }

  try {
    let blockchain = getBlockchainFromDB();
    let lastHash = blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : "0";
    let index = blockchain.length;

    for (const rawBlock of blocks) {
      if (isBlacklisted(rawBlock)) {
        return res.status(403).json({ error: 'Sender in batch is blacklisted' });
      }

      const txs = rawBlock.transactions || [];

      const totalBySender = {};
      for (const tx of txs) {
        if (tx.sender === "System") continue;
        if (!totalBySender[tx.sender]) totalBySender[tx.sender] = 0;
        totalBySender[tx.sender] += tx.amount;
      }

      for (const sender in totalBySender) {
        const balance = getBalanceFromDB(sender);
        if (balance < totalBySender[sender]) {
          return res.status(400).json({
            error: `Insufficient balance for ${sender}`
          });
        }
      }

      const recalculatedHash = calculateHash(index, rawBlock.timestamp, txs, lastHash, rawBlock.nonce);
      if (recalculatedHash !== rawBlock.hash) {
        return res.status(400).json({ error: 'Hash mismatch in batch' });
      }

      if (!isValidHashDifficulty(recalculatedHash)) {
        return res.status(400).json({ error: 'Invalid hash difficulty in batch' });
      }

      const block = {
        index,
        timestamp: rawBlock.timestamp,
        transactions: txs,
        previousHash: lastHash,
        hash: recalculatedHash,
        nonce: rawBlock.nonce
      };

      addBlockToDB(block);
      lastHash = recalculatedHash;
      index++;
      console.log(`📦 Block ${block.index} added`);
    }

    res.json({ success: true });

  } catch (err) {
    console.error("❌ Error in /batch-add-blocks:", err);
    res.status(500).json({ error: 'Batch server error' });
  }
});

// 💰 GET /balance/:address
app.get('/balance/:address', (req, res) => {
  const { address } = req.params;

  if (BLACKLIST.has(address)) {
    return res.status(403).json({ error: 'Address is blacklisted' });
  }

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

  if (BLACKLIST.has(address)) {
    return res.status(403).json({ error: 'Address is blacklisted' });
  }

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
