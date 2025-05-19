// pages/api/save-values.js
import { MongoClient } from 'mongodb';

let cachedClient = null;

async function getClient() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return (cachedClient = client);
}

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { email, topValues } = req.body;
  if (!email || !Array.isArray(topValues)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    const client = await getClient();
    const db = client.db('MENG');           // ← 실제 DB 이름으로 바꾸세요
    const col = db.collection('values');    // ← 실제 컬렉션 이름으로 바꾸세요

    const result = await col.insertOne({
      email,
      topValues,
      createdAt: new Date(),
    });
    console.log('▶ Inserted ID:', result.insertedId);
    return res.status(200).json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('▶ MongoDB Error:', error);
    return res.status(500).json({ success: false, error: 'Database write failed' });
  }
}
