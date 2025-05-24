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
  const email =
    typeof raw === "string" && raw.trim() !== "" ? raw.toLowerCase() : null;
  if (!email) {
    return res.status(400).json({ message: "Missing email" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const record = await db.collection("strengths").findOne({ email });

    // **여기만 바꿨습니다**: record가 없어도 200 OK 로 빈 배열을 내려줍니다.
    const strengths: string[][] = record?.strengths ?? [];
    return res.status(200).json({ strengths });
  } catch (err) {
    console.error("get-strengths error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
