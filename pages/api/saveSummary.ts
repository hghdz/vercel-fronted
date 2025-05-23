// pages/api/saveSummary.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

// 0️⃣ 환경 변수로 DB 이름 지정
const DB_NAME = process.env.MONGODB_DB_NAME || "your_database_name";
if (!DB_NAME) {
  throw new Error("Please set the MONGODB_DB_NAME environment variable");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1️⃣ CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
    // 5️⃣ 명시적인 DB 이름 사용
    const db = client.db(DB_NAME);
    console.log(`🔍 Using DB: ${db.databaseName}`);

    const collection = db.collection("summaries");
    const insertResult = await collection.insertOne({
      email,
      summary,
      createdAt: new Date(),
    });
    const insertedId = insertResult.insertedId;

    // 6️⃣ 삽입된 문서 확인
    const insertedDoc = await collection.findOne({ _id: insertedId });
    console.log("✅ InsertedDoc:", insertedDoc);

    return res.status(201).json({
      success: true,
      dbName: db.databaseName,
      insertedId,
      insertedDoc,
    });
  } catch (error) {
    console.error("💥 [saveSummary] Failed to save summary:", error);
    return res.status(500).json({ error: "Failed to save summary" });
  }
}