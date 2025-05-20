export default async function handler(req, res) {
  const { method, body } = req;

  const testUrls = [
    'https://api.getoridium.com/api/ban/',
    'https://api.getoridium.com/api/ban/list',
    'https://api.getoridium.com/api/banned-wallets',
    'https://api.getoridium.com/api/wallets/blacklist'
  ];

  let debug = [];

  for (const url of testUrls) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.ADMIN_SECRET}`
        },
        body: method === 'GET' ? undefined : JSON.stringify(body)
      });

      const text = await response.text();

      debug.push({
        url,
        status: response.status,
        preview: text.slice(0, 100)
      });

      try {
        const data = JSON.parse(text);
        return res.status(response.status).json(data);
      } catch {
        continue; // passe au suivant
      }

    } catch (err) {
      debug.push({ url, error: err.message });
    }
  }

  return res.status(502).json({
    error: "No valid API route responded with JSON.",
    details: debug
  });
}