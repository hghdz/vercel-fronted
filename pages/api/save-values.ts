// pages/api/save-values.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

type Data = { success: boolean } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { email, topValues } = req.body;
  if (!email || !Array.isArray(topValues)) {
    return res.status(400).json({ error: "email과 topValues 배열이 필요합니다." });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    // 컬렉션 이름(jobValues)을 본인 환경에 맞게 변경하세요
    await db.collection("jobValues").updateOne(
      { email },
      { $set: { topValues, updatedAt: new Date() } },
      { upsert: true }
    );
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "서버 오류 발생" });
  }
}
