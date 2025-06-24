// /pages/api/save-strengths.ts
import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "../../lib/mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
