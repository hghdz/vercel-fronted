// pages/api/saveSummary.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1️⃣ CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");                    // 모든 출처 허용
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");        // 허용 메서드
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");        // 허용 헤더

  // 2️⃣ Preflight 요청(OPTIONS)에 200 응답
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 3️⃣ POST가 아니면 405
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 4️⃣ 본 요청 처리
  const { email, summary } = req.body;
  if (
    !email ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({ error: "Invalid or missing email" });
  }
  if (!summary || typeof summary !== "string") {
    return res.status(400).json({ error: "Missing or invalid summary" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("summaries").insertOne({
      email,
      summary,
      createdAt: new Date(),
    });

    // ⑤ InsertOne 결과 로깅
    console.log(
      `✅ [saveSummary] Inserted document _id=${result.insertedId}, acknowledged=${result.acknowledged}`
    );

    return res.status(201).json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("💥 [saveSummary] Failed to save summary:", error);
    return res.status(500).json({ error: "Failed to save summary" });
  }
}
