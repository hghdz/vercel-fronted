import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "@/lib/mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  // ✅ OPTIONS 프리플라이트 요청 처리
  if (req.method === "OPTIONS") return res.status(200).end()

  // ✅ POST 외의 메서드 거부
  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않은 메서드입니다." })
  }

  // ✅ 이메일 유효성 검사
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ error: "이메일이 필요합니다." })
  }

  try {
    const client = await clientPromise
    const db = client.db("MENG")

    // ✅ jobs 컬렉션에서 최신 직업 정보
    const job = await db.collection("jobs").findOne(
      { email },
      {
        sort: { createdAt: -1 },
        projection: { _id: 0, chinese: 1, pinyin: 1, meaning: 1 },
      }
    )

    // ✅ summaries 컬렉션에서 최신 보고서
    const summary = await db.collection("summaries").findOne(
      { email },
      {
        sort: { createdAt: -1 },
        projection: { _id: 0, summary: 1 },
      }
    )

    // ✅ 둘 다 없으면 404
    if (!job && !summary) {
      return res.status(404).json({ error: "직업 정보가 없습니다." })
    }

    // ✅ 필요한 값만 추출해서 응답
    return res.status(200).json({
      chinese: job?.chinese || "",
      pinyin: job?.pinyin || "",
      meaning: job?.meaning || "",
      summary: summary?.summary || "",
    })
  } catch (err) {
    console.error("❌ 직업 정보 조회 실패:", err)
    return res.status(500).json({ error: "서버 오류가 발생했습니다." })
  }
}
