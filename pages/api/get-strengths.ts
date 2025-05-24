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

  // OPTIONS 요청에 대한 응답
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET 요청만 처리
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // 이메일 쿼리 파라미터 받기
  const raw = req.query.email;
  const email =
    typeof raw === "string" && raw.trim() !== "" ? raw.toLowerCase() : null;

  console.log("Received email:", email);  // 받은 이메일 값 확인

  if (!email) {
    return res.status(400).json({ message: "Missing email" });
  }

  try {
    // MongoDB 클라이언트 연결
    const client = await clientPromise;
    const db = client.db();
    
    // 이메일로 데이터 조회
    const record = await db.collection("strengths").findOne({ email });

    // 데이터가 없으면 빈 배열 반환
    const strengths: string[][] = record?.strengths ?? [];

    // 정상적으로 데이터를 반환
    return res.status(200).json({ strengths });
  } catch (err) {
    // 오류 발생 시 로그 출력 및 서버 에러 반환
    console.error("get-strengths error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
