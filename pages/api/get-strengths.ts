// pages/api/get-strengths.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS 헤더
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const raw = req.query.email;
  const email = typeof raw === "string" && raw.trim() ? raw.toLowerCase() : null;
  console.log("[get-strengths] Received email:", email);
  if (!email) {
    return res.status(400).json({ message: "Missing email" });
  }

  try {
    const client = await clientPromise;
    console.log("[get-strengths] clientPromise resolved");
    
    // MONGODB_DB env가 없으면 기본값으로 'MENG' 사용
    const dbName = process.env.MONGODB_DB || "MENG";
    const db = client.db(dbName);
    console.log("[get-strengths] Using DB:", db.databaseName);

    const record = await db
      .collection("strengths")
      .findOne({ email });
    console.log("[get-strengths] Record found:", record);

    const strengths: string[][] = record?.strengths ?? [];
    console.log("[get-strengths] Returning strengths:", strengths);

    return res.status(200).json({ strengths });
  } catch (err) {
    console.error("[get-strengths] ERROR:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
