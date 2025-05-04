import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
    const unit_amount = Math.max(1, Math.floor(price * 100)); // Stripe attend des centimes min. 1¢

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `ORID Purchase – ${amount} ORID`,
            metadata: { wallet }
          },
          unit_amount,
        },
        quantity: Math.floor(amount * 10000) // conversion en centièmes
      }],
      success_url: 'https://tonsite.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://tonsite.com/cancel',
      metadata: { wallet }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('❌ Stripe Checkout error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;