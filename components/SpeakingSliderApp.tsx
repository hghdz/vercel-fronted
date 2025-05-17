'use client'

import React, { useRef, useState, useMemo, useEffect } from 'react'
import { strengths } from '../src/data/strengths'
import styles from './SpeakingSliderApp.module.css'
import { useUser } from '@auth0/nextjs-auth0/client' // 혹은 Google 로그인 context

const WINDOW_ORDER = ['open', 'blind', 'hidden', 'unknown'] as const
const WINDOW_LABELS: Record<string, string> = {
  open: '🔓 열린 창',
  blind: '🙈 보이지 않는 창',
  hidden: '🤫 숨긴 창',
  unknown: '❓ 미지의 창',
}
const IMAGE_BASE = 'https://cdn.jsdelivr.net/gh/hghdz/card-selector-app/images'

const SpeakingSliderApp = () => {
  const { user } = useUser() // 로그인된 유저 정보 가져오기
  const [result, setResult] = useState<any>(null)
  const [index, setIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // ✅ MongoDB에서 강점 데이터 불러오기
  useEffect(() => {
    const fetchStrengths = async () => {
      if (!user?.email) return

      const res = await fetch(`/api/get-strengths?email=${user.email}`)
      const data = await res.json()

      if (data?.open) {
        setResult(data)
      } else {
        alert('해당 이메일의 결과가 없습니다.')
      }
    }

    fetchStrengths()
  }, [user?.email])

  const slides = useMemo(() => {
    const all: any[] = []
    if (!result) return all

    for (const type of WINDOW_ORDER) {
      const hanziList = result[type] || []
      hanziList.forEach((hanzi: string) => {
        const data = strengths.find((s) => s.hanzi === hanzi)
        if (data) all.push({ ...data, windowType: type })
      })
    }

    return all
  }, [result])

  const current = slides[index]

  const highlight = (text: string, keyword: string) =>
    text.replace(new RegExp(keyword, 'g'), `<span style="color:red;font-weight:bold;">${keyword}</span>`)

  const sentence = useMemo(() => {
    if (!current) return { zh: '', py: '', kr: '' }

    return {
      zh:
        (current.windowType === 'blind'
          ? `朋友说${current.baseSentence}`
          : current.windowType === 'hidden'
          ? `我觉得${current.baseSentence}`
          : current.windowType === 'unknown'
          ? current.unknownSentence
          : current.baseSentence) + '。',

      py:
        current.windowType === 'blind'
          ? `Péngyou shuō ${current.basePinyin}`
          : current.windowType === 'hidden'
          ? `Wǒ juéde ${current.basePinyin}`
          : current.windowType === 'unknown'
          ? current.unknownPinyin
          : current.basePinyin,

      kr:
        current.windowType === 'blind'
          ? `친구가 말하길 ${current.desc}`
          : current.windowType === 'hidden'
          ? `내가 생각하기에 ${current.desc}`
          : current.windowType === 'unknown'
          ? current.unknownDesc
          : current.desc,
    }
  }, [current])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        if (audioRef.current) {
          audioRef.current.src = url
          audioRef.current.play()
        }
        setMediaRecorder(null)
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch {
      alert('🎙 마이크 권한이 필요합니다.')
    }
  }

  const stopRecording = () => {
    mediaRecorder?.stop()
    setIsRecording(false)
  }

  const currentWindowIndex = current ? WINDOW_ORDER.indexOf(current.windowType) : -1

  if (!result || slides.length === 0) return <div className={styles.wrapper}>로딩 중...</div>

  return (
    <div className={styles.wrapper}>
      <div className={styles.windowLabel}>
        {current && WINDOW_LABELS[current.windowType]}
      </div>

      <div className={styles.progressBarTrack}>
        {WINDOW_ORDER.map((type, i) => (
          <div
            key={type}
            className={styles.progressSegment}
            style={{
              backgroundColor: i === currentWindowIndex ? '#6366f1' : '#e5e7eb',
            }}
          />
        ))}
      </div>

      <div className={styles.slider}>
        <button
          className={styles.navButton}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          ◀
        </button>

        <div className={styles.imageBox}>
          {current && (
            <img
              key={current.hanzi}
              src={`${IMAGE_BASE}/${current.hanzi}.png`}
              alt={current.hanzi}
              className={styles.img}
            />
          )}
        </div>

        <button
          className={styles.navButton}
          onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
        >
          ▶
        </button>
      </div>

      <div className={styles.sentenceBox}>
        <p dangerouslySetInnerHTML={{ __html: highlight(sentence.zh, current.hanzi) }} />
        <p dangerouslySetInnerHTML={{ __html: highlight(sentence.py, current.pinyin) }} />
        <p dangerouslySetInnerHTML={{ __html: highlight(sentence.kr, current.hanzi) }} />
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${styles.listen}`}
          onClick={() => {
            const utter = new SpeechSynthesisUtterance(sentence.zh)
            utter.lang = 'zh-CN'
            speechSynthesis.speak(utter)
          }}
        >
          🔊 듣기
        </button>

        <button
          className={`${styles.button} ${
            isRecording ? styles.stop : styles.record
          }`}
          onClick={() => (!mediaRecorder ? startRecording() : stopRecording())}
        >
          {isRecording ? '⏹ 중지' : '🎙 녹음'}
        </button>

        <button
          className={`${styles.button} ${styles.play}`}
          onClick={() => {
            if (audioRef.current) audioRef.current.play()
          }}
        >
          ▶ 재생
        </button>
      </div>

      <audio ref={audioRef} controls className={styles.audio} />
    </div>
  )
}

export default SpeakingSliderApp
