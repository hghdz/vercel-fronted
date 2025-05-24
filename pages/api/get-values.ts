import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" });

  const raw = req.query.email;
  const email = typeof raw === "string" && raw.trim() ? raw.trim().toLowerCase() : null;
  if (!email) return res.status(400).json({ message: "Missing email" });

  try {
    const client = await clientPromise;
    const db = client.db("MENG");
    const record = await db.collection("values").findOne({ email });

    console.log("[get-values] record from DB:", record);

    const valuesArray = Array.isArray(record?.values) ? record.values! : [];
    const topValuesArray = Array.isArray((record as any)?.topValues)
      ? (record as any).topValues
      : [];

    const payload = (valuesArray.length ? valuesArray : topValuesArray).slice(0, 5);

    console.log("[get-values] payload to client:", payload);

    return res.status(200).json({
      values: payload,
      _debug: record,
    });
  } catch (err) {
    console.error("[get-values] ERROR:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
