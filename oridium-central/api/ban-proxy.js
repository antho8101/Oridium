export default async function handler(req, res) {
  const { method, body } = req;

  const testUrls = [
    'https://api.getoridium.com/api/ban/',
    'https://api.getoridium.com/api/ban/list',
    'https://api.getoridium.com/api/banned-wallets',
    'https://api.getoridium.com/api/wallets/blacklist'
  ];

  for (const url of testUrls) {
    try {
      console.log(`🔍 Test: ${url}`);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.ADMIN_SECRET}`
        },
        body: method === 'GET' ? undefined : JSON.stringify(body)
      });

      const text = await response.text();a

      // Vérifie si c’est un JSON valide
      try {
        const data = JSON.parse(text);
        console.log(`✅ Réponse valide depuis ${url}`);
        return res.status(response.status).json(data);
      } catch {
        console.warn(`⚠️ Réponse non JSON depuis ${url}:`, text.slice(0, 80));
      }

    } catch (err) {
      console.error(`❌ Erreur avec ${url}:`, err.message);
    }
  }

  // Si aucun des endpoints n’a fonctionné :
  res.status(502).json({ error: "No valid API route responded with JSON." });
}
