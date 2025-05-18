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
import styles from "../styles/MBTISpeaking.module.css"

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
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => onAuthStateChanged(auth, u => setUser(u)), [])

  const [resultType, setResultType] = useState<string | null>(null)
  useEffect(() => {
    if (user?.email) {
      fetch(`/api/get-mbti?email=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => setResultType(data.mbti))
        .catch(() => alert("MBTI 결과를 불러오는 중 오류가 발생했습니다."))
    }
  }, [user])

  const [mode, setMode] = useState<"basic" | "advanced">("basic")
  const [idx, setIdx] = useState(0)
  const [step, setStep] = useState(0)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const practiceAreaRef = useRef<HTMLDivElement>(null)

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

  function addControls(text: string) {
    const ctrl = document.createElement("div")
    ctrl.className = styles.buttonGroup

    type Btn = { type: "tts" | "rec" | "play"; label: string; disabled?: boolean }
    const btns: Btn[] = [
      { type: "tts", label: "🔊 듣기" },
      { type: "rec", label: "⏺️ 녹음" },
      { type: "play", label: "▶️ 재생", disabled: true },
    ]

    btns.forEach(({ type, label, disabled }) => {
      const b = document.createElement("button")
      b.className = styles.button
      if (type === "tts") b.classList.add(styles.listen)
      if (type === "rec") b.classList.add(styles.record)
      if (type === "play") b.classList.add(styles.play)
      b.textContent = label
      if (disabled) b.disabled = true

      if (type === "tts") {
        b.addEventListener("click", () => {
          const u = new SpeechSynthesisUtterance(text)
          u.lang = "zh-CN"
          u.rate = 0.7
          speechSynthesis.speak(u)
        })
      }
      if (type === "rec") {
        b.addEventListener("click", () => {
          if (!recorder) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
              const r = new MediaRecorder(stream)
              const chunks: BlobPart[] = []
              r.ondataavailable = e => chunks.push(e.data)
              r.onstop = () => {
                const url = URL.createObjectURL(
                  new Blob(chunks, { type: "audio/webm" })
                )
                if (audioRef.current) audioRef.current.src = url
                setRecorder(null)
              }
              r.start()
              setRecorder(r)
            })
          } else {
            recorder.stop()
          }
        })
      }
      if (type === "play") {
        b.addEventListener("click", () => {
          audioRef.current?.play()
        })
      }

      ctrl.appendChild(b)
    })

    const next = document.createElement("button")
    next.className = styles.button
    next.classList.add(styles.nextBtn)
    next.textContent = "다음"
    next.addEventListener("click", () => setStep(s => s + 1))
    ctrl.appendChild(next)

    practiceAreaRef.current?.appendChild(ctrl)
  }

  useEffect(() => {
    if (!resultType) return
    const area = practiceAreaRef.current!
    area.innerHTML = ""
    setStep(prev => prev)

    // Slider
    const slider = document.createElement("div")
    slider.className = styles.slider
    const prevBtn = document.createElement("button")
    prevBtn.className = styles.navButton
    prevBtn.textContent = "◀"
    prevBtn.onclick = () => {
      setIdx(i => Math.max(0, i - 1))
      setStep(0)
    }
    const imgBox = document.createElement("div")
    imgBox.className = styles.imageBox
    const img = document.createElement("img")
    img.className = styles.img
    img.src = baseUrl + imageMap[letters[idx]]
    img.alt = letters[idx]
    imgBox.appendChild(img)
    const nextBtn = document.createElement("button")
    nextBtn.className = styles.navButton
    nextBtn.textContent = "▶"
    nextBtn.onclick = () => {
      setIdx(i => Math.min(letters.length - 1, i + 1))
      setStep(0)
    }
    slider.append(prevBtn, imgBox, nextBtn)
    area.appendChild(slider)

    // Sentence
    const box = document.createElement("div")
    box.className = styles.sentenceBox
    area.appendChild(box)

    if (mode === "basic") {
      if (idx < basicPairs.length) {
        const [A, B] = basicPairs[idx]
        if (step % 2 === 0) {
          box.innerHTML = `
            <p>你是<span class='${styles.highlight}'>${A}</span>还是<span class='${styles.highlight}'>${B}</span>？</p>
            <p class='pinyin'>Nǐ shì <span class='${styles.highlight}'>${A}</span> háishi <span class='${styles.highlight}'>${B}</span>?</p>
            <p class='translation'>(너는 ${A}이니 아니면 ${B}이니?)</p>`
          addControls(`你是${A}还是${B}?`)
        } else {
          box.innerHTML = `
            <p>我是<span class='${styles.highlight}'>${A}</span>。</p>
            <p class='pinyin'>Wǒ shì <span class='${styles.highlight}'>${A}</span>.</p>
            <p class='translation'>(나는 ${A}야.)</p>`
          addControls(`我是${A}`)
        }
      } else {
        if (step % 2 === 0) {
          box.innerHTML = `
            <p>你的MBTI是什么？</p>
            <p class='pinyin'>Nǐ de MBTI shì shénme?</p>
            <p class='translation'>(너의 MBTI는 무엇이니?)</p>`
          addControls("你的MBTI是什么?")
        } else {
          box.innerHTML = `
            <p>我的MBTI是<span class='${styles.highlight}'>${resultType}</span>。</p>
            <p class='pinyin'>Wǒ de MBTI shì <span class='${styles.highlight}'>${resultType}</span>.</p>
            <p class='translation'>(나의 MBTI는 ${resultType}야.)</p>`
          addControls(`我的MBTI是${resultType}`)
        }
      }
    } else {
      const [C1, C2] = fullMap[letters[idx]]
      const p1 = pinyinMap[C1],
        p2 = pinyinMap[C2]
      const k1 = korMap[C1],
        k2 = korMap[C2]
      if (step % 2 === 0) {
        box.innerHTML = `
          <p>你是<span class='${styles.highlight}'>${C1}</span>型还是<span class='${styles.highlight}'>${C2}</span>型？</p>
          <p class='pinyin'>Nǐ shì <span class='${styles.highlight}'>${p1}</span> xíng háishi <span class='${styles.highlight}'>${p2}</span> xíng?</p>
          <p class='translation'>(너는 ${k1}형이니 아니면 ${k2}형이니?)</p>`
        addControls(`你是${C1}型还是${C2}型?`)
      } else {
        box.innerHTML = `
          <p>我是<span class='${styles.highlight}'>${C1}</span>型。</p>
          <p class='pinyin'>Wǒ shì <span class='${styles.highlight}'>${p1}</span> xíng.</p>
          <p class='translation'>(나는 ${k1}형이야.)</p>`
        addControls(`我是${C1}型`)
      }
    }
  }, [mode, idx, step, resultType])

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
        <button onClick={() => signOut(auth)} className={styles.logoutButton}>
          🚪 로그아웃
        </button>
      </header>

      <h2>말하기 연습</h2>
      <div className={styles.dropdown}>
        <select
          value={mode}
          onChange={e => {
            setMode(e.target.value as any)
            setIdx(0)
            setStep(0)
          }}
        >
          <option value="basic">기본문형</option>
          <option value="advanced">심화문형</option>
        </select>
      </div>

      <div ref={practiceAreaRef} id="practiceArea" />
      <audio ref={audioRef} controls className={styles.audio} />
    </div>
  )
}
