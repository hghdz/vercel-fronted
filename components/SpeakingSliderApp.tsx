'use client'

import React, { useRef, useState, useMemo } from 'react'
import { strengths } from '../src/data/strengths'
import styles from './SpeakingSliderApp.module.css'

const studentResults = {
  하현우: { open: ["创造力", "好奇心"], blind: ["判断力"], hidden: ["勇敢"], unknown: ["领导力"] },
  김민지: { open: ["热情", "善良"], blind: ["洞察力"], hidden: ["坚持"], unknown: ["信仰"] },
  박소연: { open: ["诚实", "爱心"], blind: ["懂别人"], hidden: ["谨慎"], unknown: ["希望"] },
} as const

const WINDOW_ORDER = ["open", "blind", "hidden", "unknown"] as const
const WINDOW_LABELS: Record<string, string> = {
  open: "열린 창",
  blind: "보이지 않는 창",
  hidden: "숨긴 창",
  unknown: "미지의 창",
}

const IMAGE_BASE = 'https://cdn.jsdelivr.net/.wrapper {
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(to bottom, #ebf8ff, #ffffff);
  font-family: sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.progressBar {
  display: flex;
  gap: 8px;
  width: 100%;
  max-width: 600px;
}

.progress {
  height: 8px;
  flex: 1;
  border-radius: 9999px;
  background: #e5e7eb;
  transition: all 0.3s ease;
}

.progress.active {
  background: #d8b4fe;
}

.slider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.imageBox {
  width: 256px;
  height: 256px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  border: 4px solid #d8b4fe;
}

.img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.buttonGroup {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.button {
  padding: 8px 24px;
  border-radius: 9999px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.button:active {
  transform: scale(0.95);
}

.listen { background: #bbf7d0; color: #166534; }
.record { background: #bfdbfe; color: #1e3a8a; }
.stop   { background: #f87171; color: #7f1d1d; }
.play   { background: #e9d5ff; color: #6b21a8; }

.audio {
  width: 240px;
  height: 36px;
  border-radius: 9999px;
  border: 1px solid #e5e7eb;
  background: linear-gradient(to right, #f9fafb, #e5e7eb);
  padding: 4px 8px;
}
h/hghdz/card-selector-app/images'

const SpeakingSliderApp = () => {
  const [selectedStudent, setSelectedStudent] = useState<keyof typeof studentResults>('하현우')
  const [index, setIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const result = studentResults[selectedStudent]

  const slides = useMemo(() => {
    const all: any[] = []
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

  const sentence = {
    zh: (
      current.windowType === "blind"
        ? `朋友说${current.baseSentence}`
        : current.windowType === "hidden"
        ? `我觉得${current.baseSentence}`
        : current.windowType === "unknown"
        ? current.unknownSentence
        : current.baseSentence
    ),
    py: (
      current.windowType === "blind"
        ? `Péngyou shuō ${current.basePinyin}`
        : current.windowType === "hidden"
        ? `Wǒ juéde ${current.basePinyin}`
        : current.windowType === "unknown"
        ? current.unknownPinyin
        : current.basePinyin
    ),
    kr: (
      current.windowType === "blind"
        ? `친구가 말하길 ${current.desc}`
        : current.windowType === "hidden"
        ? `내가 생각하기에 ${current.desc}`
        : current.windowType === "unknown"
        ? current.unknownDesc
        : current.desc
    )
  }

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
      alert("🎙 마이크 권한이 필요합니다.")
    }
  }

  const stopRecording = () => {
    mediaRecorder?.stop()
    setIsRecording(false)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.progressBar}>
        {[...Array(slides.length)].map((_, i) => (
          <div key={i} className={`${styles.progress} ${i <= index ? styles.active : ''}`} />
        ))}
      </div>

      <div className={styles.slider}>
        <button onClick={() => setIndex((i) => Math.max(0, i - 1))}>◀</button>

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

        <button onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}>▶</button>
      </div>

      <div>
        <p dangerouslySetInnerHTML={{ __html: highlight(sentence.zh, current.hanzi) }} />
        <p dangerouslySetInnerHTML={{ __html: highlight(sentence.py, current.hanzi) }} />
        <p dangerouslySetInnerHTML={{ __html: highlight(sentence.kr, current.hanzi) }} />
      </div>

      <div className={styles.buttonGroup}>
        <button className={`${styles.button} ${styles.listen}`} onClick={() => {
          const utter = new SpeechSynthesisUtterance(sentence.zh)
          utter.lang = 'zh-CN'
          speechSynthesis.speak(utter)
        }}>🔊 듣기</button>

        <button className={`${styles.button} ${isRecording ? styles.stop : styles.record}`} onClick={() => (!mediaRecorder ? startRecording() : stopRecording())}>
          {isRecording ? '⏹ 중지' : '🎙 녹음'}
        </button>

        <button className={`${styles.button} ${styles.play}`} onClick={() => { if (audioRef.current) audioRef.current.play() }}>▶ 재생</button>
      </div>

      <audio ref={audioRef} controls className={styles.audio} />
    </div>
  )
}

export default SpeakingSliderApp;
