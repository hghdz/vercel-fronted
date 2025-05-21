// pages/api/save-holland.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

// 1) bodyParser 비활성화
export const config = {
  api: {
    bodyParser: false,
  },
};

const uri = process.env.MONGODB_URI!;
const dbName = "MENG";

let cachedClient: MongoClient | null = null;
async function connectToDatabase(): Promise<MongoClient> {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

// rawBody → UTF-8 문자열로 변환해 직접 JSON.parse
async function parseBody(req: NextApiRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = Buffer.from([]);
    req.on("data", (chunk) => {
      data = Buffer.concat([data, chunk]);
    });
    req.on("end", () => {
      try {
        const text = data.toString("utf8");
        resolve(JSON.parse(text));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS 헤더
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  console.log("[save-holland] 🔥 handler start");

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  let body;
  try {
    body = await parseBody(req);
  } catch (e) {
    console.error("[save-holland] ✋ body parse error", e);
    res.status(400).json({ message: "Invalid JSON" });
    return;
  }

  const { email, types, hobbies } = body;
  console.log("[save-holland] body parsed:", body);

  if (
    typeof email !== "string" ||
    !Array.isArray(types) ||
    !Array.isArray(hobbies)
  ) {
    res.status(400).json({ message: "Invalid Payload" });
    return;
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const col = db.collection("holland_practice");
    const result = await col.insertOne({
      email,
      types,
      hobbies,
      timestamp: new Date(),
    });
    console.log("[save-holland] 📦 insertedId:", result.insertedId);

    res.status(200).json({
      message: "Saved successfully",
      insertedId: result.insertedId.toString(),
    });
  } catch (err) {
    console.error("[save-holland] 💥 handler error", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
