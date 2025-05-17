// pages/api/get-strengths.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid email' })
  }

  try {
    const client = await clientPromise
    const db = client.db('MENG') // ✅ 실제 DB 이름
    const collection = db.collection('strengths') // ✅ 검사 결과가 저장된 컬렉션

    const data = await collection.findOne({ email })

    if (!data) {
      return res.status(404).json({ error: 'No results found for this email' })
    }

    res.status(200).json({
      open: data.open || [],
      blind: data.blind || [],
      hidden: data.hidden || [],
      unknown: data.unknown || []
    })
  } catch (error) {
    console.error('MongoDB fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
