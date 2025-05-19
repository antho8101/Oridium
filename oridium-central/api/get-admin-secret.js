export default function handler(req, res) {
    const secret = process.env.ADMIN_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Missing secret" });
    }
  
    res.status(200).json({ adminSecret: secret });
  }  