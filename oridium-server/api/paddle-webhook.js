import express from 'express';
import crypto from 'crypto';
import { creditOrid } from '../modules/central-bank/paddle-sales.js';

const router = express.Router();

router.post('/', express.json(), async (req, res) => {
  try {
    const signature = req.headers['paddle-signature'];
    const rawBody = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', process.env.PADDLE_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('⚠️ Invalid webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;

    if (event.event_type === 'transaction.completed') {
      const transaction = event.data;
      const customData = transaction.custom_data || {};

      const userId = customData.user_id;
      const oridAmount = Number(customData.orid_amount);

      if (userId && oridAmount > 0) {
        await creditOrid(userId, oridAmount);
        console.log(`✅ ORID credited: ${oridAmount} to ${userId}`);
      } else {
        console.warn('⚠️ Missing userId or oridAmount in webhook payload');
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Webhook processing error:', err);
    res.status(500).send('Server error');
  }
});

export default router;