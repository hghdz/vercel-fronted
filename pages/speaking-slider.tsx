// pages/speaking-slider.tsx
"use client"        // ensure this page is client-only
import dynamic from "next/dynamic"

// dynamically import your component, with SSR turned off
const SpeakingSliderApp = dynamic(
  () => import("../components/SpeakingSliderApp"),
  { ssr: false }   // ← this flag prevents it running at build time
)

export default function SpeakingSliderPage() {
  return <SpeakingSliderApp />
}
