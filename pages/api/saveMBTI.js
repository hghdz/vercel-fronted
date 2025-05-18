// pages/api/saveMBTI.js
import { MongoClient } from 'mongodb'

let cachedClient = null

export default async function handler(req, res) {
  // 1) CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // 2) POST 외 차단
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { email, mbti } = req.body
  if (!email || !mbti) {
    return res.status(400).json({ error: 'email 및 mbti 필수' })
  }

  try {
    // 3) MongoDB 연결 (한 번만)
    if (!cachedClient) {
      const client = new MongoClient(process.env.MONGODB_URI)
      await client.connect()
      cachedClient = client
    }
    const db = cachedClient.db(process.env.MONGODB_DB_NAME)
    const col = db.collection('mbti_results')

    // 4) 이미 있으면 업데이트, 없으면 삽입
    await col.updateOne(
      { email },
      { $set: { mbti, updatedAt: new Date() } },
      { upsert: true }
    )

    return res.status(200).json({ success: true })
  } catch (e) {
    console.error('[saveMBTI] Error:', e)
    return res.status(500).json({ error: '서버 에러' })
  }
}
