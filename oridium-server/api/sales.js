import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createPaddlePayLink } from '../modules/central-bank/paddle-sales.js';

dotenv.config();

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pricingPath = path.join(__dirname, '../data/pricing.json');

router.post('/sales', async (req, res) => {
  try {
    const { wallet, amount } = req.body;

    if (!wallet || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    // Lecture du prix dynamique actuel
    const raw = fs.readFileSync(pricingPath, 'utf-8');
    const { price } = JSON.parse(raw);
    const totalPrice = amount * price;

    const payUrl = await createPaddlePayLink({
      price: totalPrice,
      userId: wallet,
      oridAmount: amount
    });

    res.json({ url: payUrl });
  } catch (err) {
    console.error('❌ Paddle Pay Link error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;