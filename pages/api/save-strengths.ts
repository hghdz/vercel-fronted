// /pages/api/save-strengths.ts
import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "../../lib/mongodb"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { email, strengths } = req.body as {
      email: string
      strengths: string[][]    // 중요! 2차원 배열 형태로 받음
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || "MENG")
    const collection = db.collection("strengths")

    const filter = { email }
    const update = {
      $set: {
        strengths,
        updatedAt: new Date(),
      }
    }
    const options = { upsert: true }

    await collection.updateOne(filter, update, options)

    res.status(200).json({ message: "Success" })
  } catch (error) {
    console.error("Error saving strengths:", error)
    res.status(500).json({ message: "Server error" })
  }
}
