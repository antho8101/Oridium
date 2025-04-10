// server.js

import express from 'express';
import fs from 'fs';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const BLOCKCHAIN_FILE = './blockchain.json';

app.use(cors());
app.use(express.json()); // ✅ Nécessaire pour parser les blocs POST

// 🔁 Charge la blockchain depuis le fichier
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

// 📡 GET /blockchain
app.get('/blockchain', (req, res) => {
  res.json(blockchain);
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

// ➕ POST /add-block
app.post('/add-block', (req, res) => {
  const block = req.body;

  if (!block || typeof block !== 'object') {
    console.error("❌ Invalid block received:", block);
    return res.status(400).json({ error: 'Invalid block format' });
  }

  blockchain.push(block);

  try {
    fs.writeFileSync(BLOCKCHAIN_FILE, JSON.stringify(blockchain, null, 2));
    console.log(`🧱 Block ${block.index} added by ${block.transactions[0]?.receiver}`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Failed to write blockchain.json:', err);
    res.status(500).json({ error: 'Write error' });
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Oridium API running at http://localhost:${PORT}`);
});