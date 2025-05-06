import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stockPath = path.join(__dirname, '../data/stock.json');

// Lecture du stock actuel
function getStock() {
  const raw = fs.readFileSync(stockPath, 'utf-8');
  const { total } = JSON.parse(raw);
  return total;
}

// Mise à jour du stock (écrasement)
function setStock(newTotal) {
  fs.writeFileSync(stockPath, JSON.stringify({ total: newTotal }, null, 2));
}

// Décrémente le stock après achat ou envoi manuel
function consumeStock(amount) {
  const current = getStock();
  if (amount > current) throw new Error('Insufficient stock');
  setStock(current - amount);
}

// Incrémente le stock (régénération partielle ou complète)
function replenishStock(amount) {
  const current = getStock();
  setStock(current + amount);
}

// 🟢 Routes API (tu peux les protéger plus tard si besoin)

router.get('/', (req, res) => {
  try {
    const total = getStock();
    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read stock' });
  }
});

router.post('/inject', (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  try {
    replenishStock(amount);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to inject stock' });
  }
});

router.post('/consume', (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  try {
    consumeStock(amount);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;