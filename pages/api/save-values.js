// src/api/save-values.js

import { connectToDatabase } from "../../lib/mongodb";  // 몽고 커넥터 경로에 맞게

/** 
 * POST /api/save-values
 */
export async function POST(request) {
  try {
    const { email, values } = await request.json();
    if (!email || !values) {
      return new Response(JSON.stringify({ error: "email 또는 values 누락" }), { status: 400 });
    }

    const { db } = await connectToDatabase();
    await db
      .collection("userValues")
      .updateOne(
        { email },
        { $set: { email, values, updatedAt: new Date() } },
        { upsert: true }
      );

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    console.error("save-values 에러:", e);
    return new Response(JSON.stringify({ error: "서버 에러" }), { status: 500 });
  }
}
