import express from 'express';
const router = express.Router();

router.post('/', (req, res) => {
  const { address, pseudo } = req.body;

  if (!address || !pseudo) {
    return res.status(400).json({ error: 'Missing address or pseudo' });
  }

  // Créer la session encodée en base64
  const sessionData = Buffer.from(JSON.stringify({ address, pseudo })).toString('base64');

  res.cookie('orid_session', sessionData, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/',
    domain: '.getoridium.com', // adapte si tu n’as pas de sous-domaine
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ success: true });
});

export default router;
