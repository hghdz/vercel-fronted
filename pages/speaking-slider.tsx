// pages/speaking-slider.tsx

import dynamic from "next/dynamic"
const SpeakingSliderApp = dynamic(() => import("../components/SpeakingSliderApp"), { ssr: false })

export default function SpeakingPage() {
  return (
    <div className="min-h-screen bg-white p-4">
      <SpeakingSliderApp />
    </div>
  )
}
