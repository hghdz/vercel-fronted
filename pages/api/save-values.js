// pages/api/save-values.js
export default function handler(req, res) {
  // 1) 공통 CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');  // 필요에 따라 와일드카드(*) 대신 도메인 지정
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  // 2) 프리플라이트(OPTIONS) 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3) 실제 POST 처리
  if (req.method !== 'POST') {
    return res.status(405).end(); // 여전히 POST 이외는 금지
  }

  // TODO: body 파싱, MongoDB 연동 등 로직
  const data = req.body;
  // …
  res.status(200).json({ ok: true });
}
