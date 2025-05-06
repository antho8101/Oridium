import express from 'express';
import crypto from 'crypto';
import { creditOrid } from '../modules/central-bank/paddle-sales.js';

const router = express.Router();

router.post('/', express.json(), async (req, res) => {

  const event = req.body;

  if (event.event_type === 'transaction.completed') {
    const transaction = event.data;
    const customData = transaction.custom_data || {};
    const userId = customData.user_id;
    const oridAmount = customData.orid_amount;

    if (userId && oridAmount) {
      await creditOrid(userId, oridAmount);
      console.log(`✅ ORID credited: ${oridAmount} to ${userId}`);
    }
  }

  res.status(200).send('OK');
});

export default router;