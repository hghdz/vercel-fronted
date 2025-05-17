import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "@/lib/mongodb" // 필요시 경로 조정 (예: "../../lib/mongodb")

type StrengthsData = {
  email: string
  name: string
  strengths: string[][]
  updatedAt: Date
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { email, name, strengths } = req.body as {
      email: string
      name: string
      strengths: string[][]
    }

    const client = await clientPromise
    const db = client.db("MENG") // ← 여기를 실제 MongoDB DB 이름으로 바꿔주세요!
    const collection = db.collection<StrengthsData>("strengths")

    const filter = { email }
    const update = {
      $set: {
        name,
        strengths,
        updatedAt: new Date()
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
