// /api/get-holland.ts
import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "@/lib/mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않은 메서드입니다." })
  }

  const { email } = req.body
  if (!email) {
    return res.status(400).json({ error: "이메일이 필요합니다." })
  }

  try {
    const client = await clientPromise
    const db = client.db("MENG")
    const collection = db.collection("holland_practice")

    const result = await collection.findOne(
      { email },
      { sort: { timestamp: -1 } }
    )

    if (!result) {
      return res.status(404).json({ error: "검사 결과가 없습니다." })
    }

    const { types, hobbies } = result
    return res.status(200).json({ types, hobbies })
  } catch (err) {
    console.error("Holland 결과 조회 실패:", err)
    return res.status(500).json({ error: "서버 오류가 발생했습니다." })
  }
}
