// /pages/api/saveAllJobInfo.ts
import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "@/lib/mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // ✅ CORS 설정 (OPTIONS preflight 요청 허용)
    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        res.setHeader("Access-Control-Allow-Headers", "Content-Type")
        res.status(200).end()
        return
    }

    res.setHeader("Access-Control-Allow-Origin", "*") // 모든 출처 허용 (또는 특정 도메인으로 제한 가능)

    if (req.method !== "POST") {
        return res.status(405).json({ error: "허용되지 않은 요청 방식입니다." })
    }

    try {
        const { email, chinese, pinyin, meaning, summary } = req.body

        if (!email || !chinese || !pinyin || !meaning || !summary) {
            return res.status(400).json({ error: "모든 필드를 입력해주세요." })
        }

        const client = await clientPromise
        const db = client.db("MENG")
        const collection = db.collection("jobInfo")

        const result = await collection.insertOne({
            email,
            chinese,
            pinyin,
            meaning,
            summary,
            createdAt: new Date(),
        })

        res.status(200).json({ success: true, insertedId: result.insertedId })
    } catch (e) {
        console.error("DB 저장 오류:", e)
        res.status(500).json({ error: "서버 오류가 발생했습니다." })
    }
}
