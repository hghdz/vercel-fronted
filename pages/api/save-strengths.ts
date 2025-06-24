import type { NextApiRequest, NextApiResponse } from "next"
import clientPromise from "../../lib/mongodb" // 상대경로: vercel-clean/lib/mongodb.ts

type StrengthsData = {
  email: string
  name?: string | null
  strengths: {
    open: string[]
    blind: string[]
    hidden: string[]
    unknown: string[]
  }
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
    // email, name, strengths 객체 받기
    const { email, name, strengths } = req.body as {
      email: string
      name?: string | null
      strengths: {
        open: string[]
        blind: string[]
        hidden: string[]
        unknown: string[]
      }
    }

    if (!email || !strengths) {
      return res.status(400).json({ message: "email, strengths 필수!" })
    }

    const client = await clientPromise
    const db = client.db("MENG")
    const collection = db.collection<StrengthsData>("strengths")

    const filter = { email }
    const update = {
      $set: {
        name: name ?? null,
        strengths,
        updatedAt: new Date()
      }
    }
    const options = { upsert: true }

    await collection.updateOne(filter, update, options)

    res.status(200).json({ message: "Success" })
  } ca
