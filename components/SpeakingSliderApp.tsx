'use client'

import React, { useRef, useState, useMemo } from 'react'
import { strengths } from '../src/data/strengths'

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

const IMAGE_BASE = 'https://cdn.jsdelivr.net/gh/hghdz/card-selector-app/images'

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
  const red = (text: string) => `<span style="color:red;font-weight:bold;">${text}</span>`

  const sentence = {
    zh:
      current.windowType === "blind"
        ? `朋友说${current.baseSentence}`
        : current.windowType === "hidden"
        ? `我觉得${current.baseSentence}`
        : current.windowType === "unknown"
        ? current.unknownSentence
        : current.baseSentence,
    py:
      current.windowType === "blind"
        ? `Péngyou shuō ${current.basePinyin}`
        : current.windowType === "hidden"
        ? `Wǒ juéde ${current.basePinyin}`
        : current.windowType === "unknown"
        ? current.unknownPinyin
        : current.basePinyin,
    kr:
      current.windowType === "blind"
        ? `친구가 말하길 ${current.desc}`
        : current.windowType === "hidden"
        ? `내가 생각하기에 ${current.desc}`
        : current.windowType === "unknown"
        ? current.unknownDesc
        : current.desc,
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
    <div className="p-6 flex flex-col items-center gap-6 font-sans">
      {/* 프로그레스 바 */}
      <div className="flex gap-3">
        {WINDOW_ORDER.map((type) => (
          <div
            key={type}
            className={`rounded-full px-4 py-1 text-sm font-semibold shadow transition ${
              current.windowType === type
                ? 'bg-purple-500 text-white scale-105'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {WINDOW_LABELS[type]}
          </div>
        ))}
      </div>

      {/* 슬라이더 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="text-2xl text-gray-500 hover:text-purple-500"
        >
          ◀
        </button>

        <img
          src={`${IMAGE_BASE}/${current.hanzi}.png`}
          alt={current.hanzi}
          className="w-64 h-64 object-contain border-2 rounded-2xl shadow"
        />

        <button
          onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
          className="text-2xl text-gray-500 hover:text-purple-500"
        >
          ▶
        </button>
      </div>

      {/* 문장 */}
      <div className="text-center leading-relaxed">
        <p
          dangerouslySetInnerHTML={{ __html: red(sentence.zh) }}
          className="text-xl font-medium"
          style={{ fontFamily: 'Noto Sans SC, sans-serif' }}
        />
        <p
          dangerouslySetInnerHTML={{ __html: red(sentence.py) }}
          className="text-base text-gray-600"
        />
        <p
          dangerouslySetInnerHTML={{ __html: red(sentence.kr) }}
          className="text-base text-gray-500"
        />
      </div>

      {/* 버튼들 */}
      <div className="flex gap-4">
        <button
          onClick={() => {
            const utter = new SpeechSynthesisUtterance(sentence.zh)
            utter.lang = 'zh-CN'
            speechSynthesis.speak(utter)
          }}
          className="px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white shadow"
        >
          🔊 듣기
        </button>

        <button
          onClick={() => (!mediaRecorder ? startRecording() : stopRecording())}
          className={`px-5 py-2 rounded-full shadow text-white transition ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isRecording ? '⏹ 중지' : '🎙 녹음'}
        </button>

        <button
          onClick={() => {
            if (audioRef.current) audioRef.current.play()
          }}
          className="px-5 py-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow"
        >
          ▶ 재생
        </button>
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  )
}

export default SpeakingSliderApp;
