// pages/api/saveMBTI.js
import { MongoClient } from 'mongodb'

let cachedClient = null

export default async function handler(req, res) {
  // CORS 허용
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  console.log('[saveMBTI] got request:', req.method, req.url, 'body=', req.body)

  // POST 요청만 처리
  if (req.method !== 'POST') {
    console.warn('[saveMBTI] invalid method:', req.method)
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { email, mbti } = req.body
  if (!email || !mbti) {
    console.warn('[saveMBTI] missing fields:', req.body)
    return res.status(400).json({ error: 'email 및 mbti 필수' })
  }

  try {
    console.log('[saveMBTI] env DB name:', process.env.MONGODB_DB_NAME)

    // MongoDB 연결 (한 번만)
    if (!cachedClient) {
      const client = new MongoClient(process.env.MONGODB_URI)
      await client.connect()
      cachedClient = client
      console.log('[saveMBTI] connected to MongoDB')
    }
    const db = cachedClient.db(process.env.MONGODB_DB_NAME)
    const col = db.collection('mbti_results')

    console.log('[saveMBTI] upserting:', { email, mbti })
    await col.updateOne(
      { email },
      { $set: { mbti, updatedAt: new Date() } },
      { upsert: true }
    )
    console.log('[saveMBTI] upsert OK')

    return res.status(200).json({ success: true })
  } catch (e) {
    console.error('[saveMBTI] ERROR:', e)
    return res.status(500).json({ error: '서버 에러' })
  }
}
