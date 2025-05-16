'use client'

import React, { useRef, useState, useMemo } from 'react'
import { strengths } from '../src/data/strengths'
import { motion, AnimatePresence } from 'framer-motion'

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

const WINDOW_COLORS: Record<string, string> = {
  open: "bg-green-400",
  blind: "bg-blue-400",
  hidden: "bg-yellow-400",
  unknown: "bg-purple-400",
}

const IMAGE_BASE = 'https://cdn.jsdelivr.net/gh/hghdz/card-selector-app/images'

const SpeakingSliderApp = () => {
  const [selectedStudent, setSelectedStudent] = useState<keyof typeof studentResults>('하현우')
  const [index, setIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [direction, setDirection] = useState(0)

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
  ),
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

  const progressPercentage = (index / slides.length) * 100
  const currentColor = WINDOW_COLORS[current.windowType]

 // ... (기존 import, studentResults 등은 동일)

return (
  <div className="p-6 flex flex-col items-center gap-6 font-sans min-h-screen bg-gradient-to-b from-blue-50 to-white">
    {/* 프로그레스 바 */}
    <div className="w-full max-w-xl flex items-center gap-2">
      {[...Array(slides.length)].map((_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
            i <= index ? currentColor : 'bg-gray-200'
          }`}
        />
      ))}
    </div>

    {/* 슬라이더 전체를 감싸는 영역 */}
    <div className="relative w-80 h-72">
      {/* 좌측 버튼 */}
      <button
        onClick={() => {
          setDirection(-1)
          setIndex((i) => Math.max(0, i - 1))
        }}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 text-3xl p-2 rounded-full bg-gray-200 hover:bg-gray-300 active:scale-95 transition shadow-md"
      >
        ◀
      </button>

      {/* 슬라이드 영역 */}
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={current.hanzi}
            src={`${IMAGE_BASE}/${current.hanzi}.png`}
            alt={current.hanzi}
            className="absolute w-full h-full object-contain border-4 border-purple-200 rounded-3xl shadow-xl"
            initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        </AnimatePresence>
      </div>

      {/* 우측 버튼 */}
      <button
        onClick={() => {
          setDirection(1)
          setIndex((i) => Math.min(slides.length - 1, i + 1))
        }}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 text-3xl p-2 rounded-full bg-gray-200 hover:bg-gray-300 active:scale-95 transition shadow-md"
      >
        ▶
      </button>
    </div>

    {/* 문장 출력 */}
    <div className="text-center leading-relaxed">
      <p
        dangerouslySetInnerHTML={{ __html: highlight(sentence.zh, current.hanzi) }}
        className="text-xl font-medium mb-1 text-black"
        style={{ fontFamily: 'Noto Sans SC, sans-serif' }}
      />
      <p
        dangerouslySetInnerHTML={{ __html: highlight(sentence.py, current.hanzi) }}
        className="text-base text-gray-600"
      />
      <p
        dangerouslySetInnerHTML={{ __html: highlight(sentence.kr, current.hanzi) }}
        className="text-base text-gray-500"
      />
    </div>

    {/* 듣기/녹음/재생 버튼 */}
    <div className="flex gap-4 mt-4">
      <button
        onClick={() => {
          const utter = new SpeechSynthesisUtterance(sentence.zh)
          utter.lang = 'zh-CN'
          speechSynthesis.speak(utter)
        }}
        className="px-6 py-2 rounded-full bg-green-200 hover:bg-green-400 active:bg-green-500 active:scale-95 text-green-900 font-semibold shadow-md transition"
      >
        🔊 듣기
      </button>

      <button
        onClick={() => (!mediaRecorder ? startRecording() : stopRecording())}
        className={`px-6 py-2 rounded-full font-semibold shadow-md text-white transition active:scale-95 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 active:bg-red-700'
            : 'bg-blue-300 hover:bg-blue-500 active:bg-blue-600'
        }`}
      >
        {isRecording ? '⏹ 중지' : '🎙 녹음'}
      </button>

      <button
        onClick={() => {
          if (audioRef.current) audioRef.current.play()
        }}
        className="px-6 py-2 rounded-full bg-purple-200 hover:bg-purple-400 active:bg-purple-500 active:scale-95 text-purple-900 font-semibold shadow-md transition"
      >
        ▶ 재생
      </button>
    </div>

    {/* 오디오 재생바 */}
    <div className="mt-4 flex justify-center w-full">
      <audio
        ref={audioRef}
        controls
        className="w-[240px] h-[36px] rounded-full shadow-md border border-gray-200"
        style={{
          background: 'linear-gradient(to right, #f9fafb, #e5e7eb)',
          padding: '0.25rem 0.5rem'
        }}
      />
    </div>
  </div>
)


export default SpeakingSliderApp;
