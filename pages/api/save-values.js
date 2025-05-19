// pages/api/save-values.js
export default function handler(req, res) {
  // ─── 1) CORS 헤더 설정 ───────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  // ─── 2) 프리플라이트(OPTIONS) 요청 처리 ───────────────
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ─── 3) POST 이외 메서드 거부 ─────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  // ─── 4) 실제 POST 로직 ────────────────────────────────
  const { email, topValues } = req.body;
  // …여기에 MongoDB 저장 로직 등 기존 코드 삽입…
  return res.status(200).json({ success: true });
}
