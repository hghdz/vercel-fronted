// pages/speaking-slider.tsx
"use client"

import dynamic from "next/dynamic"
import React from "react"

// SpeakingSliderApp 을 클라이언트 전용으로 동적 로드 (SSR 비활성화)
const SpeakingSliderApp = dynamic(
  () => import("../components/SpeakingSliderApp"),
  {
    ssr: false,
    loading: () => <p style={{ textAlign: "center" }}>🔄 슬라이더 로딩 중...</p>,
  }
)

export default function SpeakingSliderPage() {
  return <SpeakingSliderApp />
}
