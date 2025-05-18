// pages/api/saveMBTI.js
export default async function handler(req, res) {
  // 1) CORS 허용
  res.setHeader('Access-Control-Allow-Origin', '*')               // 모든 도메인 허용
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // 2) Preflight(CORS) 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // 2) body에서 이메일과 MBTI 받기
  const { email, mbti } = req.body;
  if (!email || !mbti) {
    return res.status(400).json({ error: 'email 또는 mbti 누락' });
  }

  // 3) MongoDB 연결 (최초 1회만)
  if (!cachedClient) {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    cachedClient = client;
  }
  const db = cachedClient.db(process.env.MONGODB_DB_NAME);

  // 4) mbti_results 컬렉션에 upsert
  await db.collection('mbti_results').updateOne(
    { email },
    { $set: { mbti, updatedAt: new Date() } },
    { upsert: true }
  );

  // 5) 응답
  res.status(200).json({ success: true });
}
