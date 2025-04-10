// server.js

import express from 'express';
import fs from 'fs';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const BLOCKCHAIN_FILE = './blockchain.json';

app.use(cors());
app.use(express.json());

// 🔁 Charge la blockchain depuis le fichier (ou crée-la vide si elle n'existe pas)
let blockchain = [];
if (fs.existsSync(BLOCKCHAIN_FILE)) {
  try {
    blockchain = JSON.parse(fs.readFileSync(BLOCKCHAIN_FILE, 'utf-8'));
    console.log(`✅ Blockchain loaded (${blockchain.length} blocks)`);
  } catch (err) {
    console.error('❌ Failed to read blockchain.json:', err);
  }
} else {
  console.log('📂 No blockchain found, starting fresh');
}

// 🔍 GET /blockchain
app.get('/blockchain', (req, res) => {
  res.json(blockchain);
});

// ➕ POST /add-block
app.post('/add-block', (req, res) => {
  const block = req.body;
  if (!block || typeof block !== 'object') {
    return res.status(400).json({ error: 'Invalid block format' });
  }

  blockchain.push(block);
  try {
    fs.writeFileSync(BLOCKCHAIN_FILE, JSON.stringify(blockchain, null, 2));
    console.log(`🧱 Block ${block.index} added`);
  } catch (err) {
    console.error('❌ Failed to write blockchain.json:', err);
    return res.status(500).json({ error: 'Write error' });
  }

  res.json({ success: true });
});

// 💰 GET /balance/:address
app.get('/balance/:address', (req, res) => {
  const { address } = req.params;
  let balance = 0;

  blockchain.forEach(block => {
    (block.transactions || []).forEach(tx => {
      if (tx.sender === address) balance -= tx.amount;
      if (tx.receiver === address) balance += tx.amount;
    });
  });

  res.json({ address, balance });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Oridium API running at http://localhost:${PORT}`);
});