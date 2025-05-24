// pages/api/get-user-results.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '@/lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const email = Array.isArray(req.query.email) ? req.query.email[0] : req.query.email
  if (!email) return res.status(400).json({ error: 'Email required' })

  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const [mbti, strengths, values, holland, jobs, summaries] = await Promise.all([
      db.collection('mbti-results').findOne({ email }),
      db.collection('strengths').findOne({ email }),
      db.collection('values').findOne({ email }),
      db.collection('holland_practice').findOne({ email }),
      db.collection('jobs').find({ email }).toArray(),
      db.collection('summaries').findOne({ email }),
    ])

    res.status(200).json({ mbti, strengths, values, holland, jobs, summaries })
  } catch (error) {
    console.error('DB 조회 오류:', error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}
