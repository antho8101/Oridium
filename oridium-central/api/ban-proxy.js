export default async function handler(req, res) {
  const { method, body, headers, url } = req;

  // 🔁 On récupère le chemin dynamique
  const subPath = req.url.replace(/^\/api\/ban-proxy/, '');

  const finalURL = `https://api.getoridium.com/api/ban${subPath}`;

  try {
    const response = await fetch(finalURL, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ADMIN_SECRET}`
      },
      body: method === 'GET' ? undefined : JSON.stringify(body)
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      res.status(response.status).json(data);
    } catch {
      console.error("❌ Réponse non JSON :", text);
      res.status(response.status).send(text);
    }

  } catch (err) {
    console.error("❌ Erreur proxy ban :", err);
    res.status(500).json({ error: "Proxy failed" });
  }
}