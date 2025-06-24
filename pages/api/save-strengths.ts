import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "../../lib/mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 항상 CORS 허용 헤더 추가!
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  // OPTIONS preflight 처리 (CORS용)
  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }
  
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" })
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" })

  try {
    const { email, strengths } = req.body
    if (!email || !strengths)
      return res.status(400).json({ message: "Bad request" })

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || "MENG")
    await db.collection("strengths").updateOne(
      { email },
      { $set: { strengths, updatedAt: new Date() } },
      { upsert: true }
    )
    res.status(200).json({ message: "Success" })
  } catch (e) {
    res.status(500).json({ message: "Server error", error: String(e) })
  }
}
