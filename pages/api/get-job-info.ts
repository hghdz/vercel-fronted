// JobInfoCard.tsx
import * as React from "react"
import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { initializeApp, getApps } from "firebase/app"

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBNT-0C1K9_BrWLMpbfGaSVugmDpBSdajUg",
  authDomain: "meng-project-df8e1.firebaseapp.com",
  projectId: "meng-project-df8e1",
  appId: "1:795749690902:web:cd13efc26fbff5874e0f37",
}
if (!getApps().length) initializeApp(firebaseConfig)
const auth = getAuth()

// TTS 유틸 함수
function getTTSUrl(text: string): string {
  const base = "https://translate.google.com/translate_tts"
  const params = new URLSearchParams({
    ie: "UTF-8",
    q: text,
    tl: "zh-CN",
    client: "tw-ob",
  })
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(
    `${base}?${params.toString()}`
  )}`
}

export default function JobInfoCard() {
  const [email, setEmail] = useState<string | null>(null)
  const [job, setJob] = useState<{
    chinese: string
    pinyin: string
    meaning: string
    summary: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 이메일 설정 확인용
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        console.log("✅ 로그인된 이메일:", user.email)
        setEmail(user.email)
      } else {
        console.log("⚠️ 로그인 안됨, 테스트용 이메일 사용")
        setEmail("hghdz@naver.com") // 테스트 fallback
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // API fetch 요청
  useEffect(() => {
    if (!email) {
      console.log("⛔ 이메일이 설정되지 않아 요청 중단")
      return
    }

    console.log("📡 fetch 요청 시작 - email:", email)

    fetch("https://vercel-fronted-three.vercel.app/api/get-job-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("📥 API 응답 데이터:", data)
        if (!data || data.error) {
          setError("데이터를 불러올 수 없습니다.")
        } else {
          setJob(data)
        }
      })
      .catch((err) => {
        console.error("🚨 fetch 요청 오류:", err)
        setError("데이터 요청 중 문제가 발생했습니다.")
      })
  }, [email])

  if (loading) return <div>불러오는 중...</div>
  if (error) return <div style={{ color: "red" }}>{error}</div>
  if (!job) return <div>저장된 직업 정보가 없습니다.</div>

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: 22, marginBottom: 20 }}>📄 나의 직업 탐색 결과</h2>

      <div style={{
        background: "#fff",
        padding: 16,
        borderRadius: 12,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: 24,
      }}>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>🎯 선택한 직업</h3>
        <p style={{ fontSize: 16 }}>
          <strong>직업명:</strong> {job.chinese} ({job.pinyin}) / {job.meaning}
          <button
            onClick={() => new Audio(getTTSUrl(job.chinese)).play()}
            style={{
              marginLeft: 8,
              border: "none",
              background: "transparent",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
            title="중국어 발음 듣기"
          >
            🔊
          </button>
        </p>
      </div>

      <div style={{
        background: "#f9f9f9",
        padding: 16,
        borderRadius: 10,
        whiteSpace: "pre-wrap",
        lineHeight: 1.6,
      }}>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>📝 탐색 보고서</h3>
        <p>{job.summary}</p>
      </div>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "8px 16px",
            fontSize: 16,
            borderRadius: 8,
            backgroundColor: "#3b82f6",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          🔄 새로고침
        </button>
      </div>
    </div>
  )
}
