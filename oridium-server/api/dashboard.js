import { manualSend } from '../modules/central-bank/manual-send.js';

router.post('/manual-send', (req, res) => {
  const { wallet, amount } = req.body;

  if (!wallet || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid wallet or amount' });
  }

  try {
    manualSend(wallet, amount);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error manualSend:", err.message);
    res.status(500).json({ error: err.message });
  }
});