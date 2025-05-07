import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  console.log("🍪 Received cookies:", req.cookies); // ← tu peux l’enlever une fois que c’est bon

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
