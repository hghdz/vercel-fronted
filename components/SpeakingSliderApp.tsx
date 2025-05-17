// pages/speaking-slider.tsx
"use client"

import React, { useEffect, useState, useRef, useMemo } from "react"
import { initializeApp } from "firebase/app"
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from "firebase/auth"
import { strengths } from "../src/data/strengths"
import styles from "../styles/SpeakingSliderApp.module.css"

// Firebase 설정 (환경변수로 관리하세요)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

const WINDOW_ORDER = ["open", "blind", "hidden", "unknown"] as const
const WINDOW_LABELS: Record<string, string> = {
  open: "🔓 열린 창",
  blind: "🙈 보이지 않는 창",
  hidden: "🤫 숨긴 창",
  unknown: "❓ 미지의 창",
}
const IMAGE_BASE =
  "https://cdn.jsdelivr.net/gh/hghdz/card-selector-app/images"

interface ResultType {
  open: string[]
  blind: string[]
  hidden: string[]
  unknown: string[]
}

export default function SpeakingSliderPage() {
  const [user, setUser] = useState<User | null>(null)
  const [result, setResult] = useState<ResultType | null>(null)

  const [index, setIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] =
    useState<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 1) 로그인 상태 감지
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return unsub
  }, [])

  // 2) 로그인 후 데이터 호출
  useEffect(() => {
    const email = user?.email ?? ""
    if (!email) return

    ;(async () => {
      try {
        const res = await fetch(
          `/api/get-strengths?email=${encodeURIComponent(email)}`
        )
        const data = await res.json()
        if (data.open) setResult(data)
        else alert("해당 이메일의 결과가 없습니다.")
      } catch (err) {
        console.error(err)
        alert("데이터를 불러오는 중 오류가 발생했습니다.")
      }
    })()
  }, [user])

  // 로그인 전 화면
  if (!user) {
    return (
      <div className={styles.wrapper}>
        <h2>🔒 로그인이 필요합니다</h2>
        <button
          className={styles.loginButton}
          onClick={() => signInWithPopup(auth, provider)}
        >
          Google 계정으로 로그인
        </button>
      </div>
    )
  }

  // 데이터 로딩 중
  if (!result) {
    return <div className={styles.wrapper}>로딩 중…</div>
  }

  // 슬라이드용 배열 구성
  const slides = useMemo(() => {
    const all: any[] = []
    for (const type of WINDOW_ORDER) {
      ;(result[type] || []).forEach((h) => {
        const s = strengths.find((st) => st.hanzi === h)
        if (s) all.push({ ...s, windowType: type })
      })
    }
    return all
  }, [result])

  const current = slides[index]!
  const currentWindowIndex = WINDOW_ORDER.indexOf(current.windowType)

  const highlight = (text: string, keyword: string) =>
    text.replace(
      new RegExp(keyword, "g"),
      `<span style="color:red;font-weight:bold;">${keyword}</span>`
    )

  const sentence = useMemo(() => {
    if (!current) return { zh: "", py: "", kr: "" }
    return {
      zh:
        (current.windowType === "blind"
          ? `朋友说${current.baseSentence}`
          : current.windowType === "hidden"
          ? `我觉得${current.baseSentence}`
          : current.windowType === "unknown"
          ? current.unknownSentence
          : current.baseSentence) + "。",
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
  }, [current])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
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
      {/* 로그아웃 버튼 */}
      <button
        className={styles.logoutButton}
        onClick={() => signOut(auth)}
      >
        🚪 로그아웃
      </button>

      <div className={styles.windowLabel}>
        {WINDOW_LABELS[current.windowType]}
      </div>

      <div className={styles.progressBarTrack}>
        {WINDOW_ORDER.map((_, i) => (
          <div
            key={i}
            className={styles.progressSegment}
            style={{
              backgroundColor:
                i === currentWindowIndex ? "#6366f1" : "#e5e7eb",
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
          <img
            src={`${IMAGE_BASE}/${current.hanzi}.png`}
            alt={current.hanzi}
            className={styles.img}
          />
        </div>
        <button
          className={styles.navButton}
          onClick={() =>
            setIndex((i) => Math.min(slides.length - 1, i + 1))
          }
        >
          ▶
        </button>
      </div>

      <div className={styles.sentenceBox}>
        <p
          dangerouslySetInnerHTML={{
            __html: highlight(sentence.zh, current.hanzi),
          }}
        />
        <p
          dangerouslySetInnerHTML={{
            __html: highlight(sentence.py, current.pinyin),
          }}
        />
        <p
          dangerouslySetInnerHTML={{
            __html: highlight(sentence.kr, current.hanzi),
          }}
        />
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${styles.listen}`}
          onClick={() => {
            const u = new SpeechSynthesisUtterance(sentence.zh)
            u.lang = "zh-CN"
            speechSynthesis.speak(u)
          }}
        >
          🔊 듣기
        </button>
        <button
          className={`${styles.button} ${
            isRecording ? styles.stop : styles.record
          }`}
          onClick={() =>
            !mediaRecorder ? startRecording() : stopRecording()
          }
        >
          {isRecording ? "⏹ 중지" : "🎙 녹음"}
        </button>
        <button
          className={`${styles.button} ${styles.play}`}
          onClick={() => audioRef.current?.play()}
        >
          ▶ 재생
        </button>
      </div>

      <audio ref={audioRef} controls className={styles.audio} />
    </div>
  )
}
