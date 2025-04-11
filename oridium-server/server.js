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
  res.json({ ok: true, data: req.body });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Oridium API running on PORT ${PORT}`);
});