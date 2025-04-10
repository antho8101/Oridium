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
  console.log("📥 Received POST /add-block:");
  console.log(req.headers);
  console.log(req.body);

  try {
    const block = req.body;
    if (!block || typeof block !== 'object') {
      return res.status(400).json({ error: 'Invalid block format' });
    }

    blockchain.push(block);
    fs.writeFileSync(BLOCKCHAIN_FILE, JSON.stringify(blockchain, null, 2));
    console.log(`🧱 Block ${block.index} added`);
    res.json({ success: true });

  } catch (err) {
    console.error("❌ Error in /add-block:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Oridium API running at http://localhost:${PORT}`);
});