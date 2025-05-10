// api/price-history.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const historyPath = path.join(__dirname, '../data/pricing-history.json');

router.get('/', (req, res) => {
  try {
    const raw = fs.readFileSync(historyPath, 'utf-8');
    const history = JSON.parse(raw);
    res.json(history);
  } catch (err) {
    console.error("❌ Failed to read pricing-history.json:", err);
    res.status(500).json({ error: 'Failed to load pricing history' });
  }
});

export default router;