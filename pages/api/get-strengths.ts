// pages/api/get-strengths.ts
import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "../../lib/mongodb"

type ResponseData =
  | { open: string[]; blind: string[]; hidden: string[]; unknown: string[] }
  | { error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // 쿼리에서 이메일 꺼내기
  const email = Array.isArray(req.query.email)
    ? req.query.email[0]
    : req.query.email || ""
  if (!email) {
    return res.status(400).json({ error: "Missing email query" })
  }

  try {
    const client = await clientPromise
    const db = client.db("MENG")               // 데이터베이스 이름
    const doc = await db
      .collection<{
        strengths: string[][]
      }>("strengths")                          // 컬렉션 이름
      .findOne({ email })

    if (!doc) {
      return res
        .status(404)
        .json({ error: `No strengths found for ${email}` })
    }

    // MongoDB에 저장된 3단계 배열 꺼내기
    const [s1 = [], s2 = [], s3 = []] = doc.strengths

    // 네 개의 창으로 분리
    const open = s1.filter((x) => s2.includes(x))
    const blind = s2.filter((x) => !s1.includes(x))
    const hidden = s1.filter((x) => !s2.includes(x))
    const unknown = s3

    return res.status(200).json({ open, blind, hidden, unknown })
  } catch (err: any) {
    console.error("get-strengths error:", err)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
