// pages/api/save-holland.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI!
const dbName = 'MENG'      // ← 실제 쓰시는 DB 이름으로 변경하세요

let cachedClient: MongoClient | null = null
async function connectToDatabase(): Promise<MongoClient> {
  if (cachedClient) {
    console.log('[save-holland] 🛡️ using cached MongoClient')
    return cachedClient
  }
  console.log('[save-holland] 🔌 connecting to MongoDB Atlas with URI:', uri)
  const client = new MongoClient(uri)
  await client.connect()
  console.log('[save-holland] ✅ connected to MongoDB Atlas')
  cachedClient = client
  return client
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // ───── CORS 헤더 ─────
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // ───── 디버그 로그 ─────
  console.log('[save-holland] handler start')
  console.log('[save-holland] method:', req.method)
  console.log('[save-holland] body:', req.body)

  // ───── 메서드 검증 ─────
  if (req.method !== 'POST') {
    console.log('[save-holland] ✋ not a POST request')
    res.status(405).json({ message: 'Method Not Allowed' })
    return
  }

  // ───── 페이로드 검증 ─────
  const { email, types, hobbies } = req.body
  if (
    typeof email !== 'string' ||
    !Array.isArray(types) ||
    !Array.isArray(hobbies)
  ) {
    console.log('[save-holland] ⚠️ invalid payload')
    res.status(400).json({ message: 'Invalid Payload' })
    return
  }
  console.log('[save-holland] ✔️ valid payload')

  // ───── DB 저장 ─────
  try {
    const client = await connectToDatabase()
    const db = client.db(dbName)
    const col = db.collection('holland_practice')
    const result = await col.insertOne({
      email,
      types,
      hobbies,
      timestamp: new Date(),
    })
    console.log('[save-holland] 📦 insertedId:', result.insertedId)

    res.status(200).json({
      message: 'Saved successfully',
      insertedId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('[save-holland] 💥 handler Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
