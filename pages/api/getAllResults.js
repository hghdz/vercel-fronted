// pages/api/getAllResults.js
import { MongoClient } from 'mongodb';

let cachedClient = null;

export default async function handler(req, res) {
  // 1) 쿼리파라미터에서 이메일
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: 'email 쿼리 누락' });
  }

  // 2) MongoDB 연결
  if (!cachedClient) {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    cachedClient = client;
  }
  const db = cachedClient.db(process.env.MONGODB_DB_NAME);

  // 3) 각 컬렉션에서 문서 조회
  const [strengthsDoc, mbtiDoc] = await Promise.all([
    db.collection('strengths_results').findOne({ email }),
    db.collection('mbti_results').findOne({ email }),
    // 필요하면 다른 활동 컬렉션도 추가
  ]);

  // 4) 결과 합쳐서 반환
  res.status(200).json({
    strengths: strengthsDoc?.strengths || [],
    mbti: mbtiDoc?.mbti || null,
    // 나머지 활동 데이터도 같은 패턴으로
  });
}
