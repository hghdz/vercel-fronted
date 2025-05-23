// pages/api/saveSummary.ts
import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "../../lib/mongodb"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { email, summary } = req.body

  // 간단 검증
  if (
    !email ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({ error: "Invalid or missing email" })
  }
  if (!summary || typeof summary !== "string") {
    return res.status(400).json({ error: "Missing or invalid summary" })
  }

  try {
    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("summaries")
    await collection.insertOne({
      email,
      summary,
      createdAt: new Date(),
    })
    return res.status(201).json({ success: true })
  } catch (error) {
    console.error("💥 Failed to save summary:", error)
    return res.status(500).json({ error: "Failed to save summary" })
  }
}
