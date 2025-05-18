// pages/speaking/values.tsx

import React from 'react'
import { useRouter } from 'next/router'
import ValuesSpeakingSliderApp from '../../components/ValuesSpeakingSliderApp'

export default function SpeakingValuesPage() {
  const { query } = useRouter()
  const emailParam = query.email
  const email = Array.isArray(emailParam) ? emailParam[0] : emailParam

  // 이메일 정보가 없으면 안내
  if (!email) {
    return <div style={{ padding: 24 }}>이메일 정보가 없습니다.</div>
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>가치관 말하기 연습</h1>
      <ValuesSpeakingSliderApp />
