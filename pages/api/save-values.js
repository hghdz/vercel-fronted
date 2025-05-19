// pages/api/save-values.js (Next.js 예시)
import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, values } = req.body;
  const { db } = await connectToDatabase();
  await db.collection("userValues").updateOne(
    { email },
    { $set: { email, values, updatedAt: new Date() } },
    { upsert: true }
  );
  res.status(200).json({ ok: true });
}
