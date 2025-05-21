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

// CORS 허용 래퍼 함수
const allowCors = (handler: Function) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // 1) CORS 응답 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 2) Preflight 요청 대응
    if (req.method === 'OPTIONS') {
      console.log('🌐 Preflight request');
      return res.status(200).end();
    }

    // 3) 실제 요청 핸들러 호출
    return handler(req, res);
  };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // POST 이외 요청 거부
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, types, hobbies } = req.body;
  if (
    typeof email !== 'string' ||
    !Array.isArray(types) ||
    !Array.isArray(hobbies)
  ) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db();
    const collection = db.collection('holland_practice');
    await collection.insertOne({
      email,
      types,
      hobbies,
      timestamp: new Date(),
    });
    return res.status(200).json({ message: 'Saved successfully' });
  } catch (error) {
    console.error('DB 저장 오류:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export default allowCors(handler);
