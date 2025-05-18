// components/MBTISpeakingSliderApp.tsx
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

export default function MBTISpeakingSliderApp() {
  // Authentication
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => onAuthStateChanged(auth, u => setUser(u)), [])

  // Fetch MBTI result
  const [resultType, setResultType] = useState<string | null>(null)
  useEffect(() => {
    if (user?.email) {
      fetch(`/api/get-mbti?email=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => setResultType(data.mbti))
        .catch(() => alert("MBTI 결과를 불러오는 중 오류가 발생했습니다."))
    }
  }, [user])

  // Practice state
  const [mode, setMode] = useState<"basic" | "advanced">("basic")
  const [idx, setIdx] = useState(0)
  const [step, setStep] = useState(0)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const practiceAreaRef = useRef<HTMLDivElement>(null)

  // Data mappings
  const letters = useMemo(() => resultType?.split("") || [], [resultType])
  const basicPairs = [["E", "I"], ["S", "N"], ["F", "T"], ["J", "P"]]
  const imageMap: Record<string, string> = {
    E: "外向.png",
    I: "内向.png",
    S: "感觉.png",
    N: "直觉.png",
    F: "情感.png",
    T: "思考.png",
    J: "判断.png",
    P: "知觉.png",
  }
  const fullMap: Record<string, [string, string]> = {
    E: ["外向", "内向"],
    I: ["内向", "外向"],
    S: ["感觉", "直觉"],
    N: ["直觉", "感觉"],
    F: ["情感", "思考"],
    T: ["思考", "情感"],
    J: ["判断", "知觉"],
    P: ["知觉", "判断"],
  }
  const pinyinMap: Record<string, string> = {
    外向: "wàixiàng",
    内向: "nèixiàng",
    感觉: "gǎnjué",
    直觉: "zhíjué",
    情感: "qínggǎn",
    思考: "sīkǎo",
    判断: "pànduàn",
    知觉: "zhījué",
  }
  const korMap: Record<string, string> = {
    外向: "외향",
    内向: "내향",
    感觉: "감각",
    直觉: "직관",
    情感: "감정",
    思考: "사고",
    判断: "판단",
    知觉: "인지",
  }
  const baseUrl =
    "https://raw.githubusercontent.com/hghdz/card-selector-app/main/images/"

  // Recorder helper
  function attachRecorder(btn: HTMLButtonElement) {
    btn.onclick = () => {
      if (!recorder) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
          const r = new MediaRecorder(stream)
          const chunks: BlobPart[] = []
          r.ondataavailable = e => chunks.push(e.data)
          r.onstop = () => {
            const url = URL.createObjectURL(new Blob(chunks, { type: "audio/webm" }))
            if (audioRef.current) audioRef.current.src = url
            setRecorder(null)
          }
          r.start()
          setRecorder(r)
        })
      } else {
        recorder.stop()
      }
    }
  }

  // Controls: TTS, record, play
  function addControls(text: string) {
    const ctrl = document.createElement("div")
    ctrl.id = "controls"
    ;(["ttsBtn", "recBtn", "playBtn"] as const).forEach(id => {
      const b = document.createElement("button")
      b.id = id
      b.textContent =
        id === "ttsBtn" ? "🔊 듣기" : id === "recBtn" ? "⏺️ 녹음" : "▶️ 재생"
      if (id === "playBtn") b.disabled = true
      ctrl.appendChild(b)
    })
    practiceAreaRef.current?.appendChild(ctrl)
    document.getElementById("ttsBtn")?.addEventListener("click", () => {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = "zh-CN"
      u.rate = 0.7
      speechSynthesis.speak(u)
    })
    attachRecorder(document.getElementById("recBtn") as HTMLButtonElement)
    document
      .getElementById("playBtn")
      ?.addEventListener("click", () => audioRef.current?.play())
  }

  // Render practice
  useEffect(() => {
    if (!resultType) return
    const area = practiceAreaRef.current!
    area.innerHTML = ""

    // 좌/우 네비 버튼 + 이미지 박스
    const slider = document.createElement("div")
    slider.className = styles.slider
    const prev = document.createElement("button")
    prev.className = styles.navButton
    prev.textContent = "◀"
    prev.onclick = () => setIdx(i => Math.max(0, i - 1))
    const box = document.createElement("div")
    box.className = styles.imageBox
    const img = document.createElement("img")
    img.className = styles.img
    img.src = baseUrl + imageMap[letters[idx]]
    img.alt = letters[idx]
    box.appendChild(img)
    const next = document.createElement("button")
    next.className = styles.navButton
    next.textContent = "▶"
    next.onclick = () => setIdx(i => Math.min(letters.length - 1, i + 1))
    slider.append(prev, box, next)
    area.appendChild(slider)

    // 문형 + 컨트롤
    const w = document.createElement("div")
    w.className = "wrapper"
    area.appendChild(w)

    if (mode === "basic") {
      if (idx < basicPairs.length) {
        const [A, B] = basicPairs[idx]
        if (step === 0) {
          w.innerHTML = `
            <p>你是<span class='highlight'>${A}</span>还是<span class='highlight'>${B}</span>？</p>
            <p class='pinyin'>Nǐ shì <span class='highlight'>${A}</span> háishi <span class='highlight'>${B}</span>?</p>
            <p class='translation'>(너는 ${A}이니 아니면 ${B}이니?)</p>`
          addControls(`你是${A}还是${B}?`)
        } else {
          w.innerHTML = `
            <p>我是<span class='highlight'>${A}</span>。</p>
            <p class='pinyin'>Wǒ shì <span class='highlight'>${A}</span>.</p>
            <p class='translation'>(나는 ${A}야.)</p>`
          addControls(`我是${A}`)
        }
      } else {
        // Q&A 마지막
        if (step === 0) {
          w.innerHTML = `
            <p>你的MBTI是什么？</p>
            <p class='pinyin'>Nǐ de MBTI shì shénme?</p>
            <p class='translation'>(너의 MBTI는 무엇이니?)</p>`
          addControls("你的MBTI是什么?")
        } else {
          w.innerHTML = `
            <p>我的MBTI是<span class='highlight'>${resultType}</span>。</p>
            <p class='pinyin'>Wǒ de MBTI shì <span class='highlight'>${resultType}</span>.</p>
            <p class='translation'>(나의 MBTI는 ${resultType}야.)</p>`
          addControls(`我的MBTI是${resultType}`)
        }
      }
    } else {
      // advanced 모드 (App Script 원본 그대로)
      const [chiA, chiB] = fullMap[letters[idx]]
      const pinA = pinyinMap[chiA],
        pinB = pinyinMap[chiB]
      const korA = korMap[chiA],
        korB = korMap[chiB]
      if (step === 0) {
        w.innerHTML = `
          <p>你是<span class='highlight'>${chiA}</span>型还是<span class='highlight'>${chiB}</span>型？</p>
          <p class='pinyin'>Nǐ shì <span class='highlight'>${pinA}</span> xíng háishi <span class='highlight'>${pinB}</span> xíng?</p>
          <p class='translation'>(너는 ${korA}형이니 아니면 ${korB}형이니?)</p>`
        addControls(`你是${chiA}型还是${chiB}型?`)
      } else {
        w.innerHTML = `
          <p>我是<span class='highlight'>${chiA}</span>型。</p>
          <p class='pinyin'>Wǒ shì <span class='highlight'>${pinA}</span> xíng.</p>
          <p class='translation'>(나는 ${korA}형이야.)</p>`
        addControls(`我是${chiA}型`)
      }
    }
  }, [mode, idx, step, resultType])

  // 렌더링
  if (!user)
    return (
      <div className={styles.wrapper}>
        <h2>🔒 로그인 필요</h2>
        <button
          onClick={() => signInWithPopup(auth, provider)}
          className={styles.loginButton}
        >
          Google 로그인
        </button>
      </div>
    )
  if (!resultType) return <div className={styles.wrapper}>로딩...</div>

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link href="/">
          <a className={styles.homeButton}>M.E.N.G</a>
        </Link>
        <h1 className={styles.pageTitle}>MBTI 말하기 연습</h1>
        <button
          onClick={() => signOut(auth)}
          className={styles.logoutButton}
        >
          🚪 로그아웃
        </button>
      </header>

      <h2>말하기 연습</h2>
      <div className={styles.dropdownWrapper}>
        <select
          value={mode}
          onChange={e => {
            setMode(e.target.value as any)
            setIdx(0)
            setStep(0)
          }}
        >
          <option value="basic">기본 문형 & Q&A</option>
          <option value="advanced">심화 문형</option>
        </select>
      </div>

      <div ref={practiceAreaRef} id="practiceArea" />
      <audio ref={audioRef} controls className={styles.audio} />
    </div>
  )
}
