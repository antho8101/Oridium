import express from 'express';
const router = express.Router();

router.post('/', (req, res) => {
  let { address, pseudo, status } = req.body;

  if (status !== "disconnected") {
    if (!address || !pseudo) {
      return res.status(400).json({ error: 'Missing address or pseudo' });
    }
    status = "connected";
  }

  const sessionData = Buffer.from(JSON.stringify({ address, pseudo, status })).toString('base64');

  res.cookie('orid_session', sessionData, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/',
    domain: '.getoridium.com',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ success: true });
});

export default router;