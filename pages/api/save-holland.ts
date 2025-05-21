import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { email, types, hobbies } = req.body;
  if (!email || !Array.isArray(types) || !Array.isArray(hobbies)) {
    return res.status(400).json({ message: 'Invalid payload' });
  }
  try {
    const client = await connectToDatabase();
    const db = client.db();
    const collection = db.collection('holland_practice');
    await collection.insertOne({ email, types, hobbies, timestamp: new Date() });
    return res.status(200).json({ message: 'Saved successfully' });
  } catch (error) {
    console.error('DB 저장 오류:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
