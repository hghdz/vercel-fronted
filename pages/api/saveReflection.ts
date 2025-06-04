import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "../../lib/mongodb"

const DB_NAME = process.env.MONGODB_DB_NAME
if (!DB_NAME) {
  throw new Error("Please set the MONGODB_DB_NAME environment variable")
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS 설정
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  // Preflight 처리
  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  // POST 외 요청 거부
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { email, chinese, pinyin, meaning, reflection } = req.body

  if (
    !email || typeof email !== "string" ||
    !chinese || typeof chinese !== "string" ||
    !pinyin || typeof pinyin !== "string" ||
    !meaning || typeof meaning !== "string" ||
    !reflection || typeof reflection !== "string"
  ) {
    return res.status(400).json({
      error: "Invalid or missing fields: email, chinese, pinyin, meaning, reflection",
    })
  }

  try {
    const client = await clientPromise
    const db = client.db(DB_NAME)
    const collection = db.collection("reflections")

    const insertResult = await collection.insertOne({
      email,
      chinese,
      pinyin,
      meaning,
      reflection,
      createdAt: new Date(),
    })

    const insertedDoc = await collection.findOne({ _id: insertResult.insertedId })

    return res.status(201).json({
      success: true,
      insertedId: insertResult.insertedId,
      insertedDoc,
    })
  } catch (error) {
    console.error("💥 [saveReflection] Failed to save reflection:", error)
    return res.status(500).json({ error: "Failed to save reflection" })
  }
}
