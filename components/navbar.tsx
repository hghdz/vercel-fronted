'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth'

// Firebase 설정 (프레이머 컴포넌트 코드에서 가져옴)
const firebaseConfig = {
  apiKey: "AIzaSyCPkxqIO8_gR4zUeC33FkLmahJuv7pArQg",
  authDomain: "meng-project-df8e1.firebaseapp.com",
  projectId: "meng-project-df8e1",
  appId: "1:795749690902:web:9c788a277e1c30254e0f37",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

const LoginButton = () => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("johariUser")
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  const handleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user
        const userData = {
          email: user.email,
          name: user.displayName,
        }
        localStorage.setItem("johariUser", JSON.stringify(userData))
        setUser(userData)
        window.location.href = "/" // 로그인 후 홈으로 이동
      })
      .catch((error) => {
        console.error("로그인 실패:", error)
      })
  }

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("johariUser")
        setUser(null)
        alert("로그아웃되었습니다.")
        window.location.reload()
      })
      .catch((error) => {
        console.error("로그아웃 실패:", error)
      })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {user ? (
        <>
          <span style={{ marginRight: 12 }}>👋 {user.name}님</span>
          <button
            style={{
              background: "#ccc",
              color: "#333",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
            }}
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </>
      ) : (
        <button
          style={{
            background: "#4285F4",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: "pointer",
          }}
          onClick={handleLogin}
        >
          Google 로그인
        </button>
      )}
    </div>
  )
}

const Navbar = () => {
  return (
    <nav
      style={{
        backgroundColor: '#f3f4f6',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexWrap: 'wrap',
      }}
    >
      <Link href="/home">🏠 홈</Link>

      <div style={{ position: 'relative' }}>
        meet-myself ▾
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            backgroundColor: '#fff',
            padding: 8,
            borderRadius: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            listStyle: 'none',
            marginTop: 4,
            display: 'none', // 나중에 hover 시 display:block 으로 바꿀 수 있음
          }}
        >
          <li><Link href="/meet-myself/mbti">mbti</Link></li>
          <li><Link href="/meet-myself/johari">johari</Link></li>
          <li><Link href="/meet-myself/values">values</Link></li>
          <li><Link href="/meet-myself/holland">holland</Link></li>
        </ul>
      </div>

      <Link href="/explore-mypath">explore-mypath</Link>

      <div style={{ position: 'relative' }}>
        narrate-in-chinese ▾
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            backgroundColor: '#fff',
            padding: 8,
            borderRadius: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            listStyle: 'none',
            marginTop: 4,
            display: 'none',
          }}
        >
          <li><Link href="/narrate-in-chinese/johari">johari</Link></li>
          <li><Link href="/narrate-in-chinese/mbti">mbti</Link></li>
          <li><Link href="/narrate-in-chinese/values">values</Link></li>
          <li><Link href="/narrate-in-chinese/holland">holland</Link></li>
        </ul>
      </div>

      <Link href="/growth-forward">growth-forward</Link>
      <Link href="/mypage">mypage</Link>
      <Link href="/resources">resources</Link>

      {/* 로그인 버튼 오른쪽 끝에 배치 */}
      <div style={{ marginLeft: 'auto' }}>
        <LoginButton />
      </div>
    </nav>
  )
}

export default Navbar
