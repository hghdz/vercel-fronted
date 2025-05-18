"use client"

import React, { useEffect, useState, useRef, useMemo } from "react"
import Link from "next/link"
import { initializeApp } from "firebase/app"
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from "firebase/auth"
import styles from "../styles/SpeakingSliderApp.module.css"

// Firebase 초기화
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
}
initializeApp(firebaseConfig)
const auth = getAuth()
const provider = new GoogleAuthProvider()

// MBTI 슬라이드 순서
const MBTI_ORDER = ["E","S","F","J"] as const
const ICON_BASE =
  "https://raw.githubusercontent.com/hghdz/card-selector-app/main/images"
// MBTI 글자 ↔ 중국어 아이콘 맵
const ICON_MAP: Record<string, string> = {
  E: "外向",
  I: "内向",
  S: "感觉",
  N: "直觉",
  F: "情感",
  T: "思考",
  J: "判断",
  P: "知觉",
}
// 반대 페어 매핑
const OPPOSITE_MAP: Record<string, string> = {
  E: 'I', I: 'E',
  S: 'N', N: 'S',
  F: 'T', T: 'F',
  J: 'P', P: 'J',
}

interface Sentence {
  zh: string
  py: string
  kr: string
}

function makeSentence(
  mbti: string,
  idx: number,
  mode: "basic" | "advanced"
): Sentence {
  const letter = mbti[idx]
  const chinese = ICON_MAP[letter]
  if (mode === "basic") {
    return {
      zh: `我是${chinese}。`,  
      py: `Wǒ shì ${chinese}.`,  
      kr: `(나는 ${chinese}야.)`,
    }
  } else {
    // 심화형: 반대 페어 묻기
    const opp = ICON_MAP[OPPOSITE_MAP[letter] || letter]
    return {
      zh: `你是${chinese}还是${opp}？`,  
      py: `Nǐ shì ${chinese} háishi ${opp}?`,  
      kr: `(너는 ${chinese}이니 아니면 ${opp}이니?)`,
    }
  }
}

export default function MBTISpeakingSliderApp() {
  const [user, setUser] = useState<User | null>(null)
  const [mbti, setMbti] = useState<string | null>(null)
  const [mode, setMode] = useState<"basic" | "advanced">("basic")
  const [index, setIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  //로그인 상태 추적
  useEffect(() => onAuthStateChanged(auth, u => setUser(u)), [])

  // 로그인 시 MBTI 데이터 로드
  useEffect(() => {
    const email = user?.email
    if (!email) return
    fetch(`/api/get-mbti?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(data => {
        if (data.mbti) setMbti(data.mbti)
        else alert("MBTI 결과가 없습니다.")
      })
      .catch(() => alert("MBTI 데이터를 불러오는 중 오류가 발생했습니다."))
  }, [user])

  // 슬라이드 배열
  const slides = useMemo(() => {
    if (!mbti) return []
    return MBTI_ORDER.map(l => ({ letter: mbti[MBTI_ORDER.indexOf(l)] }))
  }, [mbti])

  // 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      rec.ondataavailable = e => chunks.push(e.data)
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        if (audioRef.current) {
          audioRef.current.src = url
          audioRef.current.play()
        }
        setRecorder(null)
      }
      rec.start()
      setRecorder(rec)
      setIsRecording(true)
    } catch {
      alert("마이크 권한이 필요합니다.")
    }
  }
  const stopRecording = () => {
    recorder?.stop()
    setIsRecording(false)
  }

  // 랜더링 조건
  if (!user) {
    return (
      <div className={styles.wrapper}>
        <h2>🔒 로그인이 필요합니다</h2>
        <button className={styles.loginButton} onClick={() => signInWithPopup(auth, provider)}>
          Google 계정으로 로그인
        </button>
      </div>
    )
  }
  if (!mbti) {
    return <div className={styles.wrapper}>로딩 중…</div>
  }
  if (slides.length === 0) {
    return <div className={styles.wrapper}>슬라이드가 없습니다.</div>
  }

  const slide = slides[index % slides.length]
  const sentence = makeSentence(mbti, index % slides.length, mode)

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link href="/"><a className={styles.homeButton}>M.E.N.G</a></Link>
        <h1 className={styles.pageTitle}>MBTI 말하기 연습</h1>
        <button className={styles.logoutButton} onClick={() => signOut(auth)}>🚪 로그아웃</button>
      </header>
      <div className={styles.modeSelector}>
        <button onClick={() => setMode("basic")} className={mode==="basic"?styles.active:undefined}>기본형</button>
        <button onClick={() => setMode("advanced")} className={mode==="advanced"?styles.active:undefined}>심화형</button>
      </div>
      <div className={styles.slider}>
        <button className={styles.navButton} onClick={() => setIndex(i => Math.max(0, i - 1))}>◀</button>
        <div className={styles.imageBox}>
          <img
            src={`${ICON_BASE}/${ICON_MAP[slide.letter]}.png`}
            alt={slide.letter}
            className={styles.img}
          />
        </div>
        <button className={styles.navButton} onClick={() => setIndex(i => i + 1)}>▶</button>
      </div>
      <div className={styles.sentenceBox}>
        <p>{sentence.zh}</p>
        <p>{sentence.py}</p>
        <p>{sentence.kr}</p>
      </div>
      <div className={styles.buttonGroup}>
        <button className={`${styles.button} ${styles.listen}`} onClick={() => {
            const u = new SpeechSynthesisUtterance(sentence.zh)
            u.lang = "zh-CN"
            speechSynthesis.speak(u)
          }}>
          🔊 듣기
        </button>
        <button className={`${styles.button} ${isRecording?styles.stop:styles.record}`} onClick={() => isRecording ? stopRecording() : startRecording()}>
          {isRecording ? "⏹ 중지" : "🎙 녹음"}
        </button>
        <button className={`${styles.button} ${styles.play}`} onClick={() => audioRef.current?.play()}>
          ▶ 재생
        </button>
      </div>
      <audio ref={audioRef} controls className={styles.audio} />
    </div>
  )
}
