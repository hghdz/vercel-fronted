// pages/api/saveJob.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight 처리
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // POST 외 요청 거부
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { chinese, pinyin, meaning } = req.body;
  // 간단한 유효성 검사
  if (
    !chinese || typeof chinese !== "string" ||
    !pinyin  || typeof pinyin  !== "string" ||
    !meaning || typeof meaning !== "string"
  ) {
    return res
      .status(400)
      .json({ error: "Invalid or missing fields: chinese, pinyin, meaning" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("jobs");
    const result = await collection.insertOne({
      chinese,
      pinyin,
      meaning,
      createdAt: new Date(),
    });

    console.log("✅ [saveJob] Inserted job id=", result.insertedId);
    return res.status(201).json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("💥 [saveJob] Failed to save job:", error);
    return res.status(500).json({ error: "Failed to save job" });
  }
}
