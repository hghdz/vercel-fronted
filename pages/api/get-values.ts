// pages/api/get-values.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

type Data = { values: string[] } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { email } = req.query;
  if (typeof email !== "string") {
    return res.status(400).json({ error: "email 쿼리 필요" });
  }

  try {
    const client = await clientPromise;
    const db = client.db(); // 기본 DB 사용
    const doc = await db
      .collection("jobValues")     // 본인이 저장한 콜렉션 이름
      .findOne({ email }, { projection: { topValues: 1 } });

    if (!doc || !Array.isArray(doc.topValues)) {
      return res.status(404).json({ error: "데이터가 없습니다." });
    }

    res.status(200).json({ values: doc.topValues });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "서버 오류" });
  }
}
