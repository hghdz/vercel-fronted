// pages/api/get-mbti.js
import { MongoClient } from 'mongodb'

let cachedClient = null

export default async function handler(req, res) {
  const { email } = req.query
  if (!email) {
    return res.status(400).json({ error: 'email 쿼리 누락' })
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
