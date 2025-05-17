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

const firebaseConfig = {
  apiKey: "AIzaSyCPkxqIO8_gR4zUeC33FkLmahJuv7pArQg",
  authDomain: "meng-project-df8e1.firebaseapp.com",
  projectId: "meng-project-df8e1",
  storageBucket: "meng-project-df8e1.firebasestorage.app",
  messagingSenderId: "795749690902",
  appId: "1:795749690902:web:9c788a277e1c30254e0f37",
  measurementId: "G-1HMZYWKETJ"
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
const IMAGE_BASE = "https://cdn.jsdelivr.net/gh/hghdz/card-selector-app/images"

export default function SpeakingSliderPage() {
  const [user, setUser] = useState<User | null>(null)
  const [result, setResult] = useState<{
    open: string[]
    blind: string[]
    hidden: string[]
    unknown: string[]
  } | null>(null)

  const [index, setIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] =
    useState<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 1) 로그인 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
    })
    return unsubscribe
  }, [])

  // 2) 로그인 후 데이터 불러오기
  useEffect(() => {
    if (!user?.email) return
    ;(async () => {
      const res = await fetch(
        `/api/get-strengths?email=${encodeURIComponent(user.email)}`
      )
      const data = await res.json()
      if (data.open) {
        setResult(data)
      } else {
        alert("해당 이메일의 결과가 없습니다.")
      }
    })()
  }, [user])

  // 3) 로그인 전 화면
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

  // 4) 로그인 후 로딩 중
  if (!result) {
    return <div className={styles.wrapper}>로딩 중…</div>
  }

  // 슬라이드용 배열 만들기
  const slides = useMemo(() => {
    const all: any[] = []
    for (const type of WINDOW_ORDER) {
      ;(result[type] || []).forEach((h: string) => {
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
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
      {/* 로그아웃 */}
      <button
        className={styles.logoutButton}
        onClick={() => signOut(auth)}
      >
        🚪 로그아웃
      </button>

      {/* 창 라벨 */}
      <div className={styles.windowLabel}>
        {WINDOW_LABELS[current.windowType]}
      </div>

      {/* 프로그레스 바 */}
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

      {/* 슬라이더 */}
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
            key={current.hanzi}
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

      {/* 문장 */}
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

      {/* 버튼 그룹 */}
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

