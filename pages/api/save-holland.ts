import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const dbName = 'MENG';
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 👉 CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Preflight 대응
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }


  console.log('[save-holland] 🔥 handler start');
  console.log('[save-holland] method:', req.method);
  console.log('[save-holland] body:', JSON.stringify(req.body));

  if (req.method === 'OPTIONS') {
    console.log('[save-holland] OPTIONS preflight');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('[save-holland] ✋ not POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // payload 검증 성공 시
  console.log('[save-holland] ✔️ valid payload');

  try {
    const client = await connectToDatabase();
    console.log('[save-holland] connected to MongoDB');

    const db = client.db(dbName);
    const col = db.collection('holland_practice');

    const result = await col.insertOne({
      email,
      types,
      hobbies,
      timestamp: new Date(),
    });
    console.log('[save-holland] 📦 insertedId:', result.insertedId);

    return res.status(200).json({ message: 'Saved', insertedId: result.insertedId });
  } catch (error) {
    console.error('[save-holland] 💥 DB error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
