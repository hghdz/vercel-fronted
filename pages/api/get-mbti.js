// pages/api/get-mbti.js
import { MongoClient } from 'mongodb'

let cachedClient = null

export default async function handler(req, res) {
  // 1) CORS 허용
  res.setHeader('Access-Control-Allow-Origin', '*')               // 모든 도메인 허용
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // 2) Preflight(CORS) 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // 한 번만 연결
  if (!cachedClient) {
    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    cachedClient = client
  }
  const db = cachedClient.db(process.env.MONGODB_DB_NAME)

  // mbti_results 컬렉션에서 찾기
  const doc = await db.collection('mbti_results').findOne({ email })
  if (!doc) {
    return res.status(404).json({ error: '결과 없음' })
  }

  res.status(200).json({ mbti: doc.mbti })
}
