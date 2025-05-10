// api/price.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pricingPath = path.join(__dirname, '../data/pricing.json');

router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(pricingPath)) {
      return res.status(404).json({ error: 'Price data not found' });
    }

    const raw = fs.readFileSync(pricingPath, 'utf-8');
    const parsed = JSON.parse(raw);

    res.json({
      price: parsed.price,
      currency: parsed.currency || 'USD',
      updatedAt: parsed.updatedAt
    });
  } catch (err) {
    console.error("❌ Error reading pricing.json:", err);
    res.status(500).json({ error: 'Failed to retrieve price' });
  }
});

export default router;