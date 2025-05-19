export default async function handler(req, res) {
  const { method, body, headers, url } = req;

  // Log pour debug
  console.log("📩 Requête entrante :", method, url);

  // Construit le chemin dynamique depuis l’URL d’origine
  const subPath = req.url.replace(/^\/api\/ban-proxy/, '') || '/';

  // Endpoint cible
  const finalURL = `https://api.getoridium.com/api/ban${subPath}`;
  console.log("📡 Proxy vers :", finalURL);

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
