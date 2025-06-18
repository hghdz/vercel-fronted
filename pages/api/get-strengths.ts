import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "../../lib/mongodb"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" })

  const raw = req.query.email
  const email = typeof raw === "string" && raw.trim() ? raw.toLowerCase() : null
  if (!email) return res.status(400).json({ message: "Missing email" })

  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || "MENG")
    const record = await db.collection("strengths").findOne({ email })

    if (!record || !Array.isArray(record.strengths) || record.strengths.length !== 3) {
      return res.status(200).json({ open: [], blind: [], hidden: [], unknown: [] })
    }

    const [g1, g2, g3] = record.strengths

    const open = g1.filter((k) => g2.includes(k))
    const blind = g2.filter((k) => !g1.includes(k))
    const hidden = g1.filter((k) => !g2.includes(k))
    const unknown = g3

console.log("[get-strengths] 정상 작동 중");


    return res.status(200).json({ open, blind, hidden, unknown })
  } catch (err) {
    console.error("[get-strengths] ERROR:", err)
    return res.status(500).json({ message: "Internal Server Error" })
  }
}
