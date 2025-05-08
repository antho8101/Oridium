import express from 'express';
const router = express.Router();

router.post('/', (req, res) => {
  res.clearCookie('orid_session', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/',
    domain: '.getoridium.com'
  });

  res.json({ success: true });
});

export default router;