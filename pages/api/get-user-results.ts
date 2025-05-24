// pages/api/get-user-results.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '@/lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const email = Array.isArray(req.query.email) ? req.query.email[0] : req.query.email
  if (!email) return res.status(400).json({ error: 'Email required' })

  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    // 각 컬렉션에서 전체 문서 가져오기
    const [mbtiDoc, strengthsDoc, valuesDoc, hollandDoc, jobs, summariesDoc] = await Promise.all([
      db.collection('mbti_results').findOne({ email }),
      db.collection('strengths').findOne({ email }),
      db.collection('values').findOne({ email }),
      db.collection('holland_practice').findOne({ email }),
      db.collection('jobs').find({ email }).toArray(),
      db.collection('summaries').findOne({ email }),
    ])

    // 응답 데이터 구조를 프론트에 맞게 매핑
    return res.status(200).json({
      mbti: mbtiDoc?.mbti ?? null,
      strengths: strengthsDoc?.strengths ?? [],
      values: valuesDoc?.topValues ?? [],
      holland: hollandDoc
        ? { types: hollandDoc.types || [], hobbies: hollandDoc.hobbies || [] }
        : { types: [], hobbies: [] },
      jobs: jobs.map(job => ({
        _id: job._id,
        chinese: job.chinese,
        pinyin: job.pinyin,
        meaning: job.meaning,
        createdAt: job.createdAt,
      })),
      summaries: summariesDoc?.summary ?? null,
    })
  } catch (error) {
    console.error('DB 조회 오류:', error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}
