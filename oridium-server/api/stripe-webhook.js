// api/stripe-webhook.js
import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { registerStripeSale } from '../modules/central-bank/stripe-sales.js';
import bodyParser from 'body-parser';

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe recommande bodyParser.raw uniquement pour ce endpoint
router.use(bodyParser.raw({ type: 'application/json' }));

router.post('/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Signature Stripe invalide :', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const wallet = session.metadata?.wallet;
    const quantity = session.amount_total / 100; // Stripe total is in cents

    if (!wallet || !quantity) {
      console.warn('❗️ Session sans wallet ou montant invalide');
      return res.status(400).send('Missing wallet or amount');
    }

    const result = registerStripeSale(wallet, quantity);
    if (result.success) {
      console.log(`✅ Vente enregistrée pour ${wallet} : ${quantity} ORID`);
      res.json({ received: true });
    } else {
      console.error(`❌ Erreur d’enregistrement :`, result.error);
      res.status(500).send('Failed to register sale');
    }
  } else {
    res.json({ received: true });
  }
});

export default router;