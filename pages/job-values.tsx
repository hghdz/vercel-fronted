// pages/job-values.tsx

import React from 'react'
import { useRouter } from 'next/router'
import JobValueQuiz, { Question } from '../components/JobValueQuiz'
import questions from '../src/data/questions'

export default function JobValuesPage() {
  const router = useRouter()
  const { email } = router.query
  const userEmail = Array.isArray(email) ? email[0] : email

  // 이메일이 없으면 안내 메시지
  if (!userEmail) {
    return <p>이메일 정보가 필요합니다.</p>
  }

  // 말하기 연습 페이지로 이동
  const startSpeaking = (email: string) => {
    const url = `/speaking/values?email=${encodeURIComponent(email)}`
    window.open(url, '_blank')
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>직업가치관 퀴즈</h1>
      <JobValueQuiz
        questions={questions as Question[]}
        email={userEmail}
        onStartSpeaking={startSpeaking}
      />
    </div>
  )
}
