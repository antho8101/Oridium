import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stockPath = path.join(__dirname, '../data/stock.json');

// 📦 Lecture du stock actuel
function getStock() {
  const raw = fs.readFileSync(stockPath, 'utf-8');
  return JSON.parse(raw);
}

// 🟢 Route publique (lecture uniquement)
router.get('/', (req, res) => {
  try {
    const stock = getStock();
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read stock' });
  }
});

export default router;