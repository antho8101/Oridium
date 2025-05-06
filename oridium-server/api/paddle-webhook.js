const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const paddleSales = require('../modules/central-bank/paddle-sales');

router.post('/', express.json(), async (req, res) => {
  const signature = req.headers['paddle-signature'];
  const body = JSON.stringify(req.body);

  // Vérification de la signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.PADDLE_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  if (event.event_type === 'transaction.completed') {
    const transaction = event.data;
    const customData = transaction.custom_data || {};
    const userId = customData.user_id;
    const oridAmount = customData.orid_amount;

    if (userId && oridAmount) {
      await paddleSales.creditOrid(userId, oridAmount);
    }
  }

  res.status(200).send('OK');
});

export default router;