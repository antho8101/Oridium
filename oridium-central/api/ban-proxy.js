export default async function handler(req, res) {
  const { method, body } = req;

  const finalURL = 'https://api.getoridium.com/api/ban/'; // ✅ le bon endpoint confirmé

  try {
    const response = await fetch(finalURL, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ADMIN_SECRET}`
      },
      body: method === 'GET' ? undefined : JSON.stringify(body)
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      res.status(response.status).json(data);
    } catch {
      console.error("⚠️ Réponse non JSON :", text.slice(0, 100));
      res.status(response.status).send(text);
    }

  } catch (err) {
    console.error("❌ Erreur proxy ban :", err.message);
    res.status(500).json({ error: "Proxy failed" });
  }
}