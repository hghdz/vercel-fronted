import dynamic from "next/dynamic"

// 클라이언트에서만 로드되도록 설정
const DynamicSpeakingSliderApp = dynamic(
  () => import("../components/SpeakingSliderApp"),
  { ssr: false }
)

export default function SpeakingSliderPage() {
  return <DynamicSpeakingSliderApp />
}
