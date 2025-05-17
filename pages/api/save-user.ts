import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "@/lib/mongodb" // 필요 시 ../../lib/mongodb 로 바꿔주세요

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { email, name } = req.body

    const client = await clientPromise
    const db = client.db("your-db-name") // 실제 DB 이름으로 바꿔주세요
    const collection = db.collection("users")

    const filter = { email }
    const update = {
      $set: {
        name,
        updatedAt: new Date()
      }
    }
    const options = { upsert: true }

    await collection.updateOne(filter, update, options)

    res.status(200).json({ message: "User saved successfully" })
  } catch (error) {
    console.error("Error saving user:", error)
    res.status(500).json({ message: "Server error" })
  }
}

   