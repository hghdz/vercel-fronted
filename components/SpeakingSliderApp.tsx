// components/SpeakingSliderApp.tsx
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
import { strengths } from "../src/data/strengths"
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

export default function SpeakingSliderApp() {
  const [user, setUser] = useState<User | null>(null)
  const [result, setResult] = useState<ResultType | null>(null)
  const [index, setIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 사용자 인증
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return unsub
  }, [])

  // 결과 불러오기
  useEffect(() => {
    if (!user?.email) return
    ;(async () => {
      try {
        const res = await fetch(
          `/api/get-strengths?email=${encodeURIComponent(user.email)}`
        )
        const data = await res.json()
        if (data.open) setResult(data)
        else alert("해당 이메일의 결과가 없습니다.")
      } catch {
        alert("데이터를 불러오는 중 오류가 발생했습니다.")
      }
    })()
  }, [user])

  const slides = useMemo(() => {
    if (!result) return []
    const all: any[] = []
    WINDOW_ORDER.forEach((type) =>
      (result[type] || []).forEach((h) => {
        const s = strengths.find((st) => st.hanzi === h)
        if (s) all.push({ ...s, windowType: type })
      })
    )
    return all
  }, [result])

  useEffect(() => {
    if (index >= slides.length) setIndex(0)
  }, [slides, index])

  const current = slides[index]!
  const sentence = useMemo(() => {
    if (!current) return { zh: "", py: "", kr: "" }
    const base = current.baseSentence + "。"
    switch (current.windowType) {
      case "blind":
        return { zh: `朋友说${current.baseSentence}。`, py: `Péngyou shuō ${current.basePinyin}`, kr: `친구가 말하길 ${current.desc}` }
      case "hidden":
        return { zh: `我觉得${current.baseSentence}。`, py: `Wǒ juéde ${current.basePinyin}`, kr: `내가 생각하기에 ${current.desc}` }
      case "unknown":
        return { zh: current.unknownSentence + "。", py: current.unknownPinyin, kr: current.unknownDesc }
      default:
        return { zh: base, py: current.basePinyin, kr: current.desc }
    }
  }, [current])

  // Google Translate 서버사이드 프록시를 이용한 TTS 재생
  const playTTS = (text: string) => {
    const url = `/api/tts?text=${encodeURIComponent(text)}`
    const audio = new Audio(url)
    audio.play().catch((e) => console.error('TTS 재생 오류:', e, url))
  }

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

  if (!user) return (
    <div className={styles.wrapper}>
      <h2>🔒 로그인이 필요합니다</h2>
      <button className={styles.loginButton} onClick={() => signInWithPopup(auth, provider)}>
        Google 계정으로 로그인
      </button>
    </div>
  )
  if (!result) return <div className={styles.wrapper}>로딩 중…</div>
  if (slides.length === 0) return <div className={styles.wrapper}>슬라이드가 없습니다.</div>

  const currentIdx = WINDOW_ORDER.indexOf(current.windowType)
  const highlight = (text: string, key: string) => text.replace(
    new RegExp(key, 'g'),
    `<span style="color:red;font-weight:bold;">${key}</span>`
  )

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link href="/"><a className={styles.homeButton}>M.E.N.G</a></Link>
        <h1 className={styles.pageTitle}>✨강점 말하기 연습✨</h1>
        <button className={styles.logoutButton} onClick={() => signOut(auth)}>🚪 로그아웃</button>
      </header>

      <div className={styles.windowLabel}>{WINDOW_LABELS[current.windowType]}</div>
      <div className={styles.progressBarTrack}>{WINDOW_ORDER.map((_,i)=>(
        <div key={i} className={styles.progressSegment} style={{ backgroundColor: i===currentIdx?'#6366f1':'#e5e7eb' }}/>
      ))}</div>

      <div className={styles.slider}>
        <button className={styles.navButton} onClick={()=>setIndex(i=>Math.max(0,i-1))}>◀</button>
        <div className={styles.imageBox}><img src={`${IMAGE_BASE}/${current.hanzi}.png`} alt={current.hanzi} className={styles.img} key={current.hanzi}/></div>
        <button className={styles.navButton} onClick={()=>setIndex(i=>Math.min(slides.length-1,i+1))}>▶</button>
      </div>

      <div className={styles.sentenceBox}>
        <p dangerouslySetInnerHTML={{ __html: highlight(sentence.zh, current.hanzi) }}/>
        <p dangerouslySetInnerHTML={{ __html: highlight(sentence.py, current.pinyin) }}/>
        <p dangerouslySetInnerHTML={{ __html: highlight(sentence.kr, current.hanzi) }}/>
      </div>

      <div className={styles.buttonGroup}>
        <button className={`${styles.button} ${styles.listen}`} onClick={()=>playTTS(sentence.zh)}>🔊 듣기</button>
        <button className={`${styles.button} ${isRecording?styles.stop:styles.record}`} onClick={()=>!mediaRecorder?startRecording():stopRecording()}>{isRecording?'⏹ 중지':'🎙 녹음'}</button>
        <button className={`${styles.button} ${styles.play}`} onClick={()=>audioRef.current?.play()}>▶ 재생</button>
      </div>
      <audio ref={audioRef} controls className={styles.audio}/>
    </div>
  )
}
