// pages/api/tts.ts
import type { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { text } = req.query
  if (!text || Array.isArray(text)) {
    res.status(400).json({ error: 'Missing or invalid text parameter' })
    return
  }

  const ttsUrl = `https://translate.google.com/translate_tts` +
    `?ie=UTF-8&client=tw-ob&tl=zh-CN` +
    `&q=${encodeURIComponent(text)}` +
    `&ttsspeed=1&total=1&idx=0&textlen=${encodeURIComponent(text.toString().length)}`

  try {
    // Proxy request to Google TTS
    const apiRes = await fetch(ttsUrl, {
      headers: {
        'Referer': 'https://translate.google.com/',
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0'
      }
    })

    if (!apiRes.ok) {
      res.status(apiRes.status).end()
      return
    }

    const arrayBuffer = await apiRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.send(buffer)
  } catch (error) {
    console.error('TTS API error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
