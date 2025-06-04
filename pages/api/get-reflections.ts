// pages/api/get-reflections.ts
import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "@/lib/mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "POST") return res.status(405).json({ error: "허용되지 않은 메서드입니다." })

  const { email } = req.body
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "이메일이 필요합니다." })
  }

  try {
    const client = await clientPromise
    const db = client.db("MENG")

    // ✅ reflections 컬렉션에서 최신 순으로 불러오기
    const reflections = await db
      .collection("reflections")
      .find({ email })
      .sort({ createdAt: -1 })
      .project({
        _id: 0,
        chinese: 1,
        pinyin: 1,
        meaning: 1,
        reflection: 1,
        createdAt: 1,
      })
      .toArray()

    return res.status(200).json({ reflections })
  } catch (err) {
    console.error("❌ 성찰 정보 조회 실패:", err)
    return res.status(500).json({ error: "서버 오류가 발생했습니다." })
  }
}
