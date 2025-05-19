// src/utils/tts.js
import googleTTS from 'google-tts-api';

const ttsCache = new Map();

/**
 * text → google translate TTS URL
 * @param {string} text    합성할 중국어 문장
 * @param {object} options
 * @param {string} options.lang  언어 코드 (기본 'zh-CN')
 * @param {boolean} options.slow  천천히 재생 여부 (기본 false)
 * @returns {Promise<string>}     재생할 오디오 URL
 */
export async function getTTSUrl(text, { lang = 'zh-CN', slow = false } = {}) {
  const key = `${lang}|${slow}|${text}`;
  if (ttsCache.has(key)) return ttsCache.get(key);

  const url = googleTTS.getAudioUrl(text, {
    lang,
    slow,
    host: 'https://translate.google.com',
  });
  ttsCache.set(key, url);
  return url;
}
