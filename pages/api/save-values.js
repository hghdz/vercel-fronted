// pages/api/save-values.js

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI 환경변수가 필요합니다.");

const client = new MongoClient(uri);
const clientPromise = client.connect();

export default async function handler(req, res) {
  // Allow any origin (or you can replace '*' with your Framer host)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, topValues } = req.body;
  if (!email || !Array.isArray(topValues)) {
    return res
      .status(400)
      .json({ error: "email과 topValues 배열이 필요합니다." });
  }

  try {
    const db = (await clientPromise).db();
    await db
      .collection("userValues")
      .updateOne(
        { email },
        { $set: { email, topValues, updatedAt: new Date() } },
        { upsert: true }
      );
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("save-values 에러:", e);
    return res.status(500).json({ error: "서버 에러" });
  }
}
