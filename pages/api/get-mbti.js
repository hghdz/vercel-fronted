// pages/api/get-mbti.js
import { MongoClient } from 'mongodb'

let cachedClient = null

export default async function handler(req, res) {
  // CORS 허용 (프레이머 호출 시 필요하면 사용)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  console.log('[get-mbti] method:', req.method, 'url:', req.url)

  // GET만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // 쿼리에서 email 꺼내기
  const { email } = req.query
  console.log('[get-mbti] query email:', email)
  if (!email) {
    return res.status(400).json({ error: 'email 쿼리 누락' })
  }

  try {
    // MongoDB 연결 (한 번만)
    if (!cachedClient) {
      cachedClient = new MongoClient(process.env.MONGODB_URI)
      await cachedClient.connect()
      console.log('[get-mbti] connected to MongoDB')
    }
    const db = cachedClient.db(process.env.MONGODB_DB_NAME)
    const col = db.collection('mbti_results')

    // 조회
    const doc = await col.findOne({ email })
    console.log('[get-mbti] found doc:', doc)
    if (!doc) {
      return res.status(404).json({ error: '결과 없음' })
    }

    return res.status(200).json({ mbti: doc.mbti })
  } catch (error) {
    console.error('[get-mbti] ERROR:', error)
    return res.status(500).json({ error: '서버 에러' })
  }
}
