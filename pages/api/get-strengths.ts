// pages/api/get-strengths.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // 프리플라이트 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.query;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid email' });
  }

  try {
    const client = await clientPromise;
    const db = client.db("MENG");
    const record = await db
      .collection('strengths')
      .findOne({ email: email.toLowerCase() });

    if (!record) {
      return res.status(404).json({ strengths: [] });
    }

    return res.status(200).json({ strengths: record.strengths });
  } catch (error) {
    console.error('MongoDB 조회 오류:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
