// pages/api/saveMBTI.js
import { MongoClient } from 'mongodb'

// 최상단에 반드시 선언해야 합니다.
let cachedClient = null

export default async function handler(req, res) {
  // CORS 허용
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  console.log('[saveMBTI] got request:', req.method, req.url, 'body=', req.body)

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { email, mbti } = req.body
  if (!email || !mbti) {
    return res.status(400).json({ error: 'email 및 mbti 필수' })
  }

  try {
    // MongoDB 연결(한 번만)
    if (!cachedClient) {
      cachedClient = new MongoClient(process.env.MONGODB_URI)
      await cachedClient.connect()
      console.log('[saveMBTI] connected to MongoDB')
    }
    const db = cachedClient.db(process.env.MONGODB_DB_NAME)
    const col = db.collection('mbti_results')

    // upsert: 이메일이 있으면 업데이트, 없으면 삽입
    await col.updateOne(
      { email },
      { $set: { mbti, updatedAt: new Date() } },
      { upsert: true }
    )
    console.log('[saveMBTI] upsert OK for', email, mbti)

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('[saveMBTI] ERROR:', error)
    return res.status(500).json({ error: '서버 에러' })
  }
}
