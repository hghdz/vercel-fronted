// pages/api/get-strengths.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const email = typeof req.query.email === 'string' ? req.query.email : null

  if (!email) {
    return res.status(400).json({ error: 'Missing or invalid email' })
  }

  try {
    const client = await clientPromise
    const db = client.db('MENG')
    const collection = db.collection('strengths')

    const data = await collection.findOne({ email })

    if (!data) {
      return res.status(404).json({ error: 'No results found for this email' })
    }

    // 데이터 안전성 확보 (undefined 방지)
    const response = {
      open: Array.isArray(data.open) ? data.open : [],
      blind: Array.isArray(data.blind) ? data.blind : [],
      hidden: Array.isArray(data.hidden) ? data.hidden : [],
      unknown: Array.isArray(data.unknown) ? data.unknown : [],
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('MongoDB fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
