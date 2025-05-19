// api/ban.js

import express from 'express';
import {
  banWallet,
  unbanWallet,
  getBannedWallets
} from '../modules/central-bank/ban-control.js';

const router = express.Router();

// 🛡️ Middleware simple pour auth admin (env var)
router.use((req, res, next) => {
  const auth = req.headers.authorization;
  const expected = process.env.ADMIN_SECRET;
  if (!expected || auth !== `Bearer ${expected}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// 🔴 POST /api/ban -> bannir un wallet
router.post('/', (req, res) => {
  const { address, reason } = req.body;
  if (!address) return res.status(400).json({ error: "Missing address" });

  const ok = banWallet(address, reason || "Unknown");
  if (!ok) return res.status(409).json({ error: "Already banned" });

  res.json({ success: true });
});

// ♻️ POST /api/ban/unban -> débannir un wallet
router.post('/unban', (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "Missing address" });

  const ok = unbanWallet(address);
  if (!ok) return res.status(404).json({ error: "Wallet not found in banlist" });

  res.json({ success: true });
});

// 📋 GET /api/ban/list -> liste complète des wallets bannis
router.get('/list', (req, res) => {
  const list = getBannedWallets();
  res.json({ wallets: list });
});

export default router;