// pages/api/get-strengths.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // -- CORS 설정 생략 --

  const raw = req.query.email;
  const email = typeof raw === "string" && raw.trim() ? raw.toLowerCase() : null;
  console.log("[get-strengths] Received email:", email);
  if (!email) return res.status(400).json({ message: "Missing email" });

  try {
    const client = await clientPromise;
    console.log("[get-strengths] clientPromise resolved");

    // 1) default DB 사용해보기 (먼저 client.db()로!)
    const db = client.db();  
    console.log("[get-strengths] Using default DB:", db.databaseName);

    // 2) 혹은 명시적 DB_NAME 환경변수를 쓰려면
    // const db = client.db(process.env.MONGODB_DB);
    // console.log("[get-strengths] Using DB from env:", db.databaseName);

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
