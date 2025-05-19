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
initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
})
const auth = getAuth()
const provider = new GoogleAuthProvider()

type Mode = "basic" | "qa" | "advanced"

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

  const [mode, setMode] = useState<Mode>("basic")
  const [idx, setIdx] = useState(0)
  const [step, setStep] = useState(0)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const practiceAreaRef = useRef<HTMLDivElement>(null)

  const letters = useMemo(() => resultType?.split("") || [], [resultType])
  const basicPairs = [["E","I"],["S","N"],["F","T"],["J","P"]]
  const imageMap: Record<string,string> = { E:"外向.png", I:"内向.png", S:"感觉.png", N:"直觉.png", F:"情感.png", T:"思考.png", J:"判断.png", P:"知觉.png" }
  const fullMap: Record<string,[string,string]> = { E:["外向","内向"], I:["内向","外向"], S:["感觉","直觉"], N:["直觉","感觉"], F:["情感","思考"], T:["思考","情感"], J:["判断","知觉"], P:["知觉","判断"] }
  const pinyinMap: Record<string,string> = { '外向':'wàixiàng','内向':'nèixiàng','感觉':'gǎnjué','直觉':'zhíjué','情感':'qínggǎn','思考':'sīkǎo','判断':'pànduàn','知觉':'zhījué' }
  const korMap: Record<string,string> = { '外向':'외향','内向':'내향','感觉':'감각','直觉':'직관','情感':'감정','思考':'사고','判断':'판단','知觉':'인지' }
  const baseUrl = "https://raw.githubusercontent.com/hghdz/card-selector-app/main/images/"

  function addControls(text: string) {
    const wrapper = document.createElement("div")
    wrapper.className = styles.buttonGroup
    type Btn = { type: "tts"|"rec"|"play"; label: string; disabled?: boolean }
    const btns: Btn[] = [
      { type:"tts", label:"🔊 듣기" },
      { type:"rec", label:"⏺️ 녹음" },
      { type:"play", label:"▶️ 재생", disabled: true }
    ]
    btns.forEach(bi => {
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
          u.lang = "zh-CN"; u.rate = 0.7
          speechSynthesis.speak(u)
        } else if (bi.type === "rec") {
          if (!recorder) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
              const rec = new MediaRecorder(stream)
              const chunks: BlobPart[] = []
              rec.ondataavailable = e => chunks.push(e.data)
              rec.onstop = () => {
                const url = URL.createObjectURL(new Blob(chunks, { type: "audio/webm" }))
                if (audioRef.current) audioRef.current.src = url
                setRecorder(null)
              }
              rec.start(); setRecorder(rec)
            })
          } else { recorder.stop() }
        } else { audioRef.current?.play() }
      })
      wrapper.appendChild(b)
    })
    practiceAreaRef.current?.appendChild(wrapper)
  }

  useEffect(() => {
    if (!resultType) return
    const area = practiceAreaRef.current!
    area.innerHTML = ""

    // 네비게이션 + 이미지
    const slider = document.createElement("div")
    slider.className = styles.slider
    const prevBtn = document.createElement("button")
    prevBtn.className = styles.navButton
    prevBtn.textContent = "◀"
    prevBtn.style.marginRight = "16px"
    prevBtn.onclick = () => {
      if (step === 1) setStep(0)
      else if (idx > 0) { setIdx(idx - 1); setStep(0) }
    }
    const imgBox = document.createElement("div")
    imgBox.className = styles.imageBox
    if (mode === "qa") {
      imgBox.style.width = "100%"
      imgBox.style.display = "flex"
      imgBox.style.flexWrap = "wrap"  // 줄바꿈 허용
      imgBox.style.justifyContent = "center"
      imgBox.style.gap = "8px"
      letters.forEach(c => {
        const img = document.createElement("img");
        img.src = baseUrl + imageMap[c]; img.alt = c; img.className = styles.halfSize;
        imgBox.appendChild(img)
      })
    } else {
      const key = letters[idx]
      const img = document.createElement("img")
      img.src = baseUrl + imageMap[key]
      img.alt = key
      img.className = styles.img
      imgBox.appendChild(img)
    }

    const nextBtn = document.createElement("button")
    nextBtn.className = styles.navButton
    nextBtn.textContent = "▶"
    nextBtn.style.marginLeft = "16px"
    nextBtn.onclick = () => {
      if (step === 0) {
        setStep(1)
      } else {
        if (mode !== "qa") {
          if (idx < letters.length - 1) setIdx(idx + 1)
          else setIdx(0)
        }
        setStep(0)
      }
    }
    slider.append(prevBtn, imgBox, nextBtn)
    area.appendChild(slider)

    // 문장 박스
    const box = document.createElement("div")
    box.className = styles.sentenceBox
    if (mode === "basic") {
      const [A, B] = basicPairs[idx]
      box.innerHTML = step === 0
        ? `<p>你是<span class='${styles.highlight}'>${A}</span>还是<span class='${styles.highlight}'>${B}</span>？</p><p class='pinyin'>Nǐ shì <span class='${styles.highlight}'>${A}</span> háishi <span class='${styles.highlight}'>${B}</span>?</p><p class='translation'>(너는 ${A}이니 아니면 ${B}이니?)</p>`
        : `<p>我是<span class='${styles.highlight}'>${letters[idx]}</span>。</p><p class='pinyin'>Wǒ shì <span class='${styles.highlight}'>${letters[idx]}</span>.</p><p class='translation'>(나는 ${letters[idx]}야.)</p>`
    } else if (mode === "qa") {
      box.innerHTML = step === 0
        ? `<p>你的MBTI是什么？</p><p class='pinyin'>Nǐ de MBTI shì shénme?</p><p class='translation'>(너의 MBTI는 무엇이니?)</p>`
        : `<p>我的MBTI是<span class='${styles.highlight}'>${resultType}</span>。</p><p class='pinyin'>Wǒ de MBTI shì <span class='${styles.highlight}'>${resultType}</span>.</p><p class='translation'>(나의 MBTI는 ${resultType}야.)</p>`
    } else {
      const [C1, C2] = fullMap[letters[idx]]
      box.innerHTML = step === 0
        ? `<p>你是<span class='${styles.highlight}'>${C1}</span>型还是<span class='${styles.highlight}'>${C2}</span>型？</p><p class='pinyin'>Nǐ shì <span class='${styles.highlight}'>${pinyinMap[C1]}</span> xíng háishi <span class='${styles.highlight}'>${pinyinMap[C2]}</span> xíng?</p><p class='translation'>(너는 ${korMap[C1]}형이니 아니면 ${korMap[C2]}형이니?)</p>`
        : `<p>我是<span class='${styles.highlight}'>${C1}</span>型。</p><p class='pinyin'>Wǒ shì <span class='${styles.highlight}'>${pinyinMap[C1]}</span> xíng.</p><p class='translation'>(나는 ${korMap[C1]}형이야.)</p>`
    }
    area.appendChild(box)
    // QA 모드 문형 박스 가운데 정렬 및 간격 확보
    box.style.margin = "16px auto 0"

    addControls(
      step === 0
        ? (mode === "basic" ? `你是${basicPairs[idx][0]}还是${basicPairs[idx][1]}?` : mode === "qa" ? "你的MBTI是什么?" : `你是${fullMap[letters[idx]][0]}型还是${fullMap[letters[idx]][1]}型?`)
        : (mode === "basic" ? `我是${letters[idx]}` : mode === "qa" ? `我的MBTI是${resultType}` : `我是${fullMap[letters[idx]][0]}型`)
    )

  }, [mode, idx, step, resultType])

  if (!user) return (
    <div className={styles.wrapper}>
      <h2>🔒 로그인 필요</h2>
      <button onClick={() => signInWithPopup(auth, provider)} className={styles.loginButton}>
        Google 로그인
      </button>
    </div>
  )
  if (!resultType) return <div className={styles.wrapper}>로딩...</div>

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>MBTI 말하기 연습</h1>
        <Link href="/"><a className={styles.homeButton}>M.E.N.G</a></Link>
        <button onClick={() => signOut(auth)} className={styles.logoutButton}>🚪 로그아웃</button>
      </header>
      <div className={styles.dropdown}>
        <select value={mode} onChange={e => { setMode(e.target.value as Mode); setIdx(0); setStep(0) }}>
          <option value="basic">기본문형</option>
          <option value="qa">최종문형</option>
          <option value="advanced">심화문형</option>
        </select>
      </div>
      <div ref={practiceAreaRef} id="practiceArea" />
      <audio ref={audioRef} controls className={styles.audio} />
    </div>
  )
}
