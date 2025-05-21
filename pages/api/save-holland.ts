// pages/api/save-holland.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI!
const dbName = 'MENG'  // Atlas에 실제 있는 DB 이름으로

let cachedClient: MongoClient | null = null
async function connectToDatabase(): Promise<MongoClient> {
  if (cachedClient) return cachedClient
  const client = new MongoClient(uri)
  await client.connect()
  cachedClient = client
  return client
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // 1) 캐시 완전 비활성화
  res.setHeader('Cache-Control', 'no-store')

  // 2) CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  // 3) Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  console.log('[save-holland] handler start', req.method, req.body)

  // 4) POST 외 거부
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { email, types, hobbies } = req.body
  if (
    typeof email !== 'string' ||
    !Array.isArray(types) ||
    !Array.isArray(hobbies)
  ) {
    return res.status(400).json({ message: 'Invalid Payload' })
  }

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
    console.log('[save-holland] insertedId:', result.insertedId)

    return res.status(200).json({
      message: 'Saved successfully',
      insertedId: result.insertedId.toString(),
    })
  } catch (err) {
    console.error('[save-holland] Error:', err)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
