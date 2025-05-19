// pages/api/save-values.js

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI 환경변수가 필요합니다.");
}

const client = new MongoClient(uri);
const clientPromise = client.connect();

export default async function handler(req, res) {
  console.log("▶︎ handler 진입");
  console.log("▶︎ 요청 메서드:", req.method);

  // CORS 설정: 필요시 origin 을 제한하세요.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 프리플라이트 요청 처리
  if (req.method === "OPTIONS") {
    console.log("▶︎ OPTIONS 프리플라이트 응답");
    return res.status(204).end();
  }

  // POST가 아닌 요청 거절
  if (req.method !== "POST") {
    console.log("▶︎ POST 외 메서드 거절");
    return res.status(405).json({ error: "Only POST allowed" });
  }

  console.log("▶︎ POST body:", req.body);
  const { email, topValues } = req.body;

  if (!email || !Array.isArray(topValues)) {
    console.log("▶︎ 유효성 검사 실패: email or topValues 누락");
    return res
      .status(400)
      .json({ error: "email과 topValues 배열이 필요합니다." });
  }

  try {
    const db = (await clientPromise).db("MENG");
    console.log("▶︎ MongoDB 연결 성공, upsert 시도");
    await db
      .collection("userValues")
      .updateOne(
        { email },
        { $set: { email, topValues, updatedAt: new Date() } },
        { upsert: true }
      );
    console.log("▶︎ 업서트 완료");
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("▶︎ save-values 에러:", e);
    return res.status(500).json({ error: "서버 에러" });
  }
}
