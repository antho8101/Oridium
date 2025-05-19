// E:/Oridium/oridium-central/api/ban-proxy.js

export default async function handler(req, res) {
    const { method, body, headers, url } = req;
  
    // 🔁 Redirige proprement vers l'API distante
    const endpoint = url.replace('/api/ban-proxy', '/api/ban');
  
    try {
      const response = await fetch(`https://api.getoridium.com${endpoint}`, {
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
      } catch (err) {
        console.error("❌ JSON parsing error:", text);
        res.status(response.status).send(text); // renvoie brut si pas du JSON
      }
    } catch (err) {
      console.error("❌ Proxy failed:", err);
      res.status(500).json({ error: "Proxy failed" });
    }
  }  