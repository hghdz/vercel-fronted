"use client"

import React, { useEffect, useState, useRef } from "react"
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
import styles from "../styles/ValuesSpeaking.module.css"

// Firebase 초기화
initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
})
const auth = getAuth()
const provider = new GoogleAuthProvider()

export default function MBTISpeakingSliderApp() {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), [])

  const [valuesKR, setValuesKR] = useState<string[] | null>(null)
  useEffect(() => {
    if (user?.email) {
      fetch(
        `/api/get-values?email=${encodeURIComponent(user.email)}`
      )
        .then((res) => res.json())
        .then((data) => setValuesKR(data.values))
        .catch(() => alert("가치관 결과 로딩 실패"))
    }
  }, [user])

  const [idx, setIdx] = useState(0)
  const [step, setStep] = useState<0 | 1>(0)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const practiceAreaRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // 한글 → 중국어 키워드 맵
  const filenameMap: Record<string, string> = {
    능력발휘: "展现实力",
    보수: "收入高",
    안정성: "稳定性",
    "사회적 인정": "社会认可",
    사회봉사: "帮助别人",
    자기계발: "自我发展",
    창의성: "创造力",
    자율성: "自主权",
  }
  // 중국어 → 병음 맵
  const pinyinMap: Record<string, string> = {
    展现实力: "zhǎnxiàn shílì",
    收入高: "shōurù gāo",
    稳定性: "wěndìngxìng",
    社会认可: "shèhuì rènkě",
    帮助别人: "bāngzhù biérén",
    自我发展: "zìwǒ fāzhǎn",
    创造力: "chuàngzàolì",
    自主权: "zìzhǔquán",
  }
  const baseUrl =
    "https://raw.githubusercontent.com/hghdz/card-selector-app/main/images/values/"

  function addControls(text: string) {
    const area = practiceAreaRef.current!
    const wrapper = document.createElement("div")
    wrapper.className = styles.buttonGroup
    type Btn = { type: "tts" | "rec" | "play"; label: string; disabled?: boolean }
    const btns: Btn[] = [
      { type: "tts", label: "🔊 듣기" },
      { type: "rec", label: "⏺️ 녹음" },
      { type: "play", label: "▶️ 재생", disabled: true },
    ]
    btns.forEach((bi) => {
      const b = document.createElement("button")
      b.className = styles.button
      if (bi.type === "tts") b.classList.add(styles.listen)
      if (bi.type === "rec") b.classList.add(styles.record)
      if (bi.type === "play") b.classList.add(styles.play)
      b.textContent = bi.label
      if (bi.disabled) b.disabled = true
      b.addEventListener("click", () => {
        if (bi.type === "tts") {
          const u = new SpeechSynthesisUtterance(text)
          u.lang = "zh-CN"
          u.rate = 0.8
          speechSynthesis.speak(u)
        } else if (bi.type === "rec") {
          if (!recorder) {
            navigator.mediaDevices
              .getUserMedia({ audio: true })
              .then((stream) => {
                const rec = new MediaRecorder(stream)
                const chunks: BlobPart[] = []
                rec.ondataavailable = (e) => chunks.push(e.data)
                rec.onstop = () => {
                  const url = URL.createObjectURL(
                    new Blob(chunks, { type: "audio/webm" })
                  )
                  if (audioRef.current) audioRef.current.src = url
                  setRecorder(null)
                }
                rec.start()
                setRecorder(rec)
              })
          } else {
            recorder.stop()
          }
        } else {
          audioRef.current?.play()
        }
      })
      wrapper.appendChild(b)
    })
    area.appendChild(wrapper)
  }

  useEffect(() => {
    if (!valuesKR) return
    const chineseValues = valuesKR.map((kr) => filenameMap[kr] || kr)
    const area = practiceAreaRef.current!
    area.innerHTML = ""

    // Slider
    const slider = document.createElement("div")
    slider.className = styles.slider
    const prevBtn = document.createElement("button")
    prevBtn.className = styles.navButton
    prevBtn.textContent = "◀"
    prevBtn.onclick = () => {
      if (step === 1) setStep(0)
      else if (idx > 0) {
        setIdx(idx - 1)
        setStep(0)
      }
    }
    const img = document.createElement("img")
    img.src = `${baseUrl}${encodeURIComponent(chineseValues[idx])}.png`
    img.alt = chineseValues[idx]
    img.className = styles.image
    const nextBtn = document.createElement("button")
    nextBtn.className = styles.navButton
    nextBtn.textContent = "▶"
    nextBtn.onclick = () => {
      if (step === 0) setStep(1)
      else if (idx < chineseValues.length - 1) {
        setIdx(idx + 1)
        setStep(0)
      } else {
        setIdx(0)
        setStep(0)
      }
    }
    slider.append(prevBtn, img, nextBtn)
    area.appendChild(slider)

    // Sentence Box
    const box = document.createElement("div")
    box.className = styles.sentenceBox
    const key = chineseValues[idx]
    const pinyin = pinyinMap[key] || ""
    if (step === 0) {
      box.innerHTML = `
        <p>你觉得什么很重要？</p>
        <p class='${styles.pinyin}'>Nǐ juéde shénme hěn zhòngyào?</p>
        <p class='${styles.translation}'>(무엇이 중요하다고 생각하니?)</p>
      `
    } else {
      box.innerHTML = `
        <p>我觉得<span class='${styles.highlight}'>${key}</span>很重要。</p>
        <p class='${styles.pinyin}'>Wǒ juéde ${pinyin} hěn zhòngyào.</p>
        <p class='${styles.translation}'>(나는 ${key}이/가 중요하다고 생각해.)</p>
      `
    }
    area.appendChild(box)

    // Controls
    const textForTTS =
      step === 0
        ? "你觉得什么很重要？"
        : `我觉得${key}很重要。`
    addControls(textForTTS)
  }, [valuesKR, idx, step])

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
  if (!valuesKR) return <div className={styles.wrapper}>로딩...</div>

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>🎤가치관 말하기 연습🎤</h1>
        <Link href="/">
          <a className={styles.homeButton}>M.E.N.G</a>
        </Link>
        <button
          onClick={() => signOut(auth)}
          className={styles.logoutButton}
        >
          🚪 로그아웃
        </button>
      </header>
      <div ref={practiceAreaRef} id="practiceArea" />
      <audio ref={audioRef} controls className={styles.audio} />
    </div>
  )
}
