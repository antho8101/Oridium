export default async function handler(req, res) {
    const { method, body, headers, url } = req;
    const endpoint = url.replace('/api/ban-proxy', '/api/ban'); // redirige vers l’API réelle
  
    const response = await fetch(`https://api.getoridium.com${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ADMIN_SECRET}`
      },
      body: method === 'GET' ? undefined : JSON.stringify(body)
    });
  
    const data = await response.json();
    res.status(response.status).json(data);
  }  