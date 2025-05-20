import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = 'oridium-db'; // à adapter si ton nom est différent
const collectionName = 'banned_wallets';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;

  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  const { method } = req;

  if (!uri) {
    return res.status(500).json({ error: 'MONGODB_URI is not defined in environment variables.' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    if (method === 'GET') {
      const wallets = await collection.find().toArray();
      return res.status(200).json({ wallets });

    } else if (method === 'POST') {
      const { address } = req.body;

      if (!address) {
        return res.status(400).json({ error: 'Missing wallet address.' });
      }

      const exists = await collection.findOne({ address });
      if (exists) {
        return res.status(200).json({ message: 'Already banned.' });
      }

      await collection.insertOne({ address });
      return res.status(201).json({ message: 'Wallet banned successfully.' });

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.error('❌ MongoDB error:', err);
    return res.status(500).json({ error: 'Database connection failed.' });
  }
}