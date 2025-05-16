import dynamic from "next/dynamic"

const DynamicSpeakingSliderApp = dynamic(
  () => import("../components/SpeakingSliderApp"),
  { ssr: false }
)

export default function SpeakingSliderPage() {
  return <DynamicSpeakingSliderApp />
}
