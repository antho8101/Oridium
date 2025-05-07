// E:\Oridium\oridium-server\api\wallet-sync.js

import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  const cookie = req.cookies.orid_session;
  if (!cookie) return res.json({ status: 'disconnected' });

  try {
    const decoded = JSON.parse(Buffer.from(cookie, 'base64').toString('utf8'));
    return res.json({ ...decoded, status: 'connected' });
  } catch (err) {
    return res.json({ status: 'disconnected' });
  }
});

export default router;
