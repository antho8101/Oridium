// api/ban-check.js

import express from 'express';
import { getBannedWallets } from '../modules/central-bank/ban-control.js';

const router = express.Router();

// ✅ GET /api/ban/check/:address → true/false
router.get('/check/:address', (req, res) => {
  const address = req.params.address?.toLowerCase();
  if (!address) return res.status(400).json({ error: "Missing wallet address" });

  const bannedList = getBannedWallets();
  const isBanned = bannedList.some(entry => entry.address.toLowerCase() === address);

  res.json({ banned: isBanned });
});

export default router;