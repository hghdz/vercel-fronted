import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // 이메일 파싱 & 검증
  const raw = req.query.email;
  const email =
    typeof raw === "string" && raw.trim()
      ? raw.trim().toLowerCase()
      : null;
  console.log("[get-values] Received email:", email);
  if (!email) {
    return res.status(400).json({ message: "Missing email" });
  }

  try {
    const client = await clientPromise;
    console.log("[get-values] clientPromise resolved");

    // DB 이름을 직접 지정
    const db = client.db("MENG");
    console.log("[get-values] Using DB:", db.databaseName);

    // values 컬렉션에서 email로 검색
    const record = await db
      .collection("values")
      .findOne({ email });
    console.log("[get-values] Record found:", record);

    // 없으면 빈 배열 반환
    const values: any[] = record?.values ?? [];
    console.log("[get-values] Returning values:", values);

    return res.status(200).json({ values });
  } catch (err) {
    console.error("[get-values] ERROR:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
