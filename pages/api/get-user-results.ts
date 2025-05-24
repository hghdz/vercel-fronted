// pages/api/get-user-results.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '@/lib/mongodb'

// 컬렉션 이름 매핑
// mbti_results 컬렉션 → mbti 결과 저장
// strengths 컬렉션 → 강점 배열 저장 (strengths 필드)
// values 컬렉션 → 직업 가치관 저장 (topValues 필드)
// holland_practice 컬렉션 → 홀랜드 유형 저장 (types, hobbies 필드)
// jobs 컬렉션 → 탐색한 직업 저장
// summaries 컬렉션 → 직업 탐색 보고서 저장 (summary 필드)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const email = Array.isArray(req.query.email) ? req.query.email[0] : req.query.email
  if (!email) return res.status(400).json({ error: 'Email required' })

  try {
    console.log('Fetching results for:', email)
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

    console.log({ mbtiDoc, strengthsDoc, valuesDoc, hollandDoc, jobs, summariesDoc })

    // 응답 데이터 구조를 프론트에 맞게 매핑
    return res.status(200).json({
      mbti: mbtiDoc?.mbti ?? null,
      strengths: strengthsDoc?.strengths ?? strengthsDoc ?? [],
      values: valuesDoc?.topValues ?? valuesDoc ?? [],
      holland: hollandDoc
        ? { types: hollandDoc.types || [], hobbies: hollandDoc.hobbies || [] }
        : { types: [], hobbies: [] },
      jobs: jobs || [],
      summaries: summariesDoc?.summary ?? null,
    })
  } catch (error) {
    console.error('DB 조회 오류:', error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}
