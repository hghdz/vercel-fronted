"use client"
import * as React from "react"

// 창 유형 분류
const WINDOW_ORDER = ["open", "blind", "hidden", "unknown"]
const WINDOW_LABELS: Record<string, string> = {
  open: "열린 창",
  blind: "보이지 않는 창",
  hidden: "숨긴 창",
  unknown: "미지의 창",
}

// 학생별 강점 결과
const studentResults = {
  하현우: {
    open: ["创造力", "好奇心"],
    blind: ["判断力"],
    hidden: ["勇敢"],
    unknown: ["领导力"],
  },
}
const strengths = [
    {
        hanzi: "创造力",
        pinyin: "chuàngzàolì",
        desc: "나는 창의적이다.",
        baseSentence: "我很有创造力",
        basePinyin: "Wǒ hěn yǒu chuàngzàolì.",
        unknownDesc: "나는 창의력을 얻고 싶다.",
        unknownSentence: "我要有创造力",
        unknownPinyin: "Wǒ yào yǒuchuàngzàolì.",
    },
    {
        hanzi: "好奇心",
        pinyin: "hàoqíxīn",
        desc: "나는 호기심이 많다.",
        baseSentence: "我很有好奇心",
        basePinyin: "Wǒ hěn yǒu hàoqíxīn.",
        unknownDesc: "나는 호기심이 많고 싶다.",
        unknownSentence: "我要有好奇心",
        unknownPinyin: "Wǒ yào yǒu hàoqíxīn.",
    },
    {
        hanzi: "洞察力",
        pinyin: "dòngchálì",
        desc: "나는 통찰력이 뛰어나다.",
        baseSentence: "我很有洞察力",
        basePinyin: "Wǒ hěn yǒu dòngchálì.",
        unknownDesc: "나는 통찰력을 얻고 싶다.",
        unknownSentence: "我要有洞察力",
        unknownPinyin: "Wǒ yào yǒu dòngchálì.",
    },
    {
        hanzi: "爱学习",
        pinyin: "ài xuéxí",
        desc: "나는 배우는 것을 좋아한다.",
        baseSentence: "我很爱学习",
        basePinyin: "Wǒ hěn ài xuéxí.",
        unknownDesc: "나는 배우는 것을 즐기고 싶다.",
        unknownSentence: "我要爱学习",
        unknownPinyin: "Wǒ yào ài xuéxí.",
    },
    {
        hanzi: "判断力",
        pinyin: "pànduànlì",
        desc: "나는 판단력이 뛰어나다.",
        baseSentence: "我很有判断力",
        basePinyin: "Wǒ hěn yǒu pànduànlì.",
        unknownDesc: "나는 판단력을 얻고 싶다.",
        unknownSentence: "我要有判断力",
        unknownPinyin: "Wǒ yào yǒu pànduànlì.",
    },
    {
        hanzi: "勇敢",
        pinyin: "yǒnggǎn",
        desc: "나는 용감하다.",
        baseSentence: "我很勇敢",
        basePinyin: "Wǒ hěn yǒnggǎn.",
        unknownDesc: "나는 용감하고 싶다.",
        unknownSentence: "我要勇敢",
        unknownPinyin: "Wǒ yào yǒnggǎn.",
    },
    {
        hanzi: "坚持",
        pinyin: "jiānchí",
        desc: "나는 끈기가 있다.",
        baseSentence: "我很能坚持",
        basePinyin: "Wǒ hěn néng jiānchí.",
        unknownDesc: "나는 끈기 있고 싶다.",
        unknownSentence: "我要能坚持",
        unknownPinyin: "Wǒ yào néng jiānchí.",
    },
    {
        hanzi: "诚实",
        pinyin: "chéngshí",
        desc: "나는 진실하다.",
        baseSentence: "我很诚实",
        basePinyin: "Wǒ hěn chéngshí.",
        unknownDesc: "나는 진실하고 싶다.",
        unknownSentence: "我要诚实",
        unknownPinyin: "Wǒ yào chéngshí.",
    },
    {
        hanzi: "热情",
        pinyin: "rèqíng",
        desc: "나는 열정적이다.",
        baseSentence: "我很热情",
        basePinyin: "Wǒ hěn rèqíng.",
        unknownDesc: "나는 열정적이고 싶다.",
        unknownSentence: "我要热情",
        unknownPinyin: "Wǒ yào rèqíng.",
    },
    {
        hanzi: "爱心",
        pinyin: "àixīn",
        desc: "나는 사랑이 넘친다.",
        baseSentence: "我很有爱心",
        basePinyin: "Wǒ hěn yǒu àixīn.",
        unknownDesc: "나는 사랑하는 마음을 얻고 싶다.",
        unknownSentence: "我要有爱心",
        unknownPinyin: "Wǒ yào yǒu àixīn.",
    },
    {
        hanzi: "善良",
        pinyin: "shànliáng",
        desc: "나는 선하다.",
        baseSentence: "我很善良",
        basePinyin: "Wǒ hěn shànliáng.",
        unknownDesc: "나는 선하고 싶다.",
        unknownSentence: "我要善良",
        unknownPinyin: "Wǒ yào shànliáng.",
    },
    {
        hanzi: "懂别人",
        pinyin: "dǒng biéren",
        desc: "나는 다른 사람을 잘 이해한다.",
        baseSentence: "我很懂别人",
        basePinyin: "Wǒ hěn dǒng biéren.",
        unknownDesc: "나는 다른 사람을 잘 이해하고 싶다.",
        unknownSentence: "我要能懂别人",
        unknownPinyin: "Wǒ yào néng dǒng biéren.",
    },
    {
        hanzi: "合作",
        pinyin: "hézuò",
        desc: "나는 협력을 잘 한다.",
        baseSentence: "我很会合作",
        basePinyin: "Wǒ hěnhuì hézuò.",
        unknownDesc: "나는 협력을 잘 하고 싶다. ",
        unknownSentence: "我要会合作",
        unknownPinyin: "Wǒ yào huì hézuò.",
    },
    {
        hanzi: "公正",
        pinyin: "gōngzhèng",
        desc: "나는 공정하다.",
        baseSentence: "我很公正",
        basePinyin: "Wǒ hěn gōngzhèng.",
        unknownDesc: "나는 공정하고 싶다.",
        unknownSentence: "我要公正",
        unknownPinyin: "Wǒ yào gōngzhèng.",
    },
    {
        hanzi: "领导力",
        pinyin: "lǐngdǎolì",
        desc: "나는 리더십이 뛰어나다.",
        baseSentence: "我很有领导力",
        basePinyin: "Wǒ hěn yǒu lǐngdǎolì.",
        unknownDesc: "나는 리더십을 얻고 싶다.",
        unknownSentence: "我要有领导力",
        unknownPinyin: "Wǒ yào yǒu lǐngdǎolì.",
    },
    {
        hanzi: "宽容",
        pinyin: "kuānróng",
        desc: "나는 관대하다.",
        baseSentence: "我很宽容",
        basePinyin: "Wǒ hěn kuānróng.",
        unknownDesc: "나는 관대하고 싶다.",
        unknownSentence: "我要宽容",
        unknownPinyin: "Wǒ yào kuānróng.",
    },
    {
        hanzi: "谦虚",
        pinyin: "qiānxū",
        desc: "나는 겸손하다.",
        baseSentence: "我很谦虚",
        basePinyin: "Wǒ hěn qiānxū.",
        unknownDesc: "나는 겸손하고 싶다.",
        unknownSentence: "我要谦虚",
        unknownPinyin: "Wǒ yào qiānxū.",
    },
    {
        hanzi: "谨慎",
        pinyin: "jǐnshèn",
        desc: "나는 신중하다.",
        baseSentence: "我很谨慎",
        basePinyin: "Wǒ hěn jǐnshèn.",
        unknownDesc: "나는 신중하고 싶다.",
        unknownSentence: "我要谨慎",
        unknownPinyin: "Wǒ yào jǐnshèn.",
    },
    {
        hanzi: "自我调节",
        pinyin: "zìwǒtiáojié",
        desc: "나는 자기조절을 잘한다.",
        baseSentence: "我很会自我调节",
        basePinyin: "Wǒ hěn huì zìwǒtiáojié.",
        unknownDesc: "나는 자기조절능력을 얻고 싶다.",
        unknownSentence: "我要会自我调节",
        unknownPinyin: "Wǒ yào huì zìwǒdiàojié.",
    },
    {
        hanzi: "美感",
        pinyin: "měigǎn",
        desc: "나는 아름다운 것을 사랑한다.",
        baseSentence: "我很有美感",
        basePinyin: "Wǒ hěn yǒu měigǎn.",
        unknownDesc: "나는 아름다운 것을 사랑하고 싶다.",
        unknownSentence: "我要有美感",
        unknownPinyin: "Wǒ yào yǒu měigǎn.",
    },
    {
        hanzi: "懂得感恩",
        pinyin: "dǒngde gǎn'ēn",
        desc: "나는 감사할 줄 안다.",
        baseSentence: "我很懂得感恩",
        basePinyin: "Wǒ hěn dǒngde gǎn'ēn.",
        unknownDesc: "나는 감사하는 마음을 얻고 싶다.",
        unknownSentence: "我要懂得感恩",
        unknownPinyin: "Wǒ yào gǎnēn.",
    },
    {
        hanzi: "希望",
        pinyin: "xīwàng",
        desc: "나는 희망적이다.",
        baseSentence: "我很有希望",
        basePinyin: "Wǒ hěn yǒu xīwàng.",
        unknownDesc: "나는 희망적이고 싶다.",
        unknownSentence: "我要有希望",
        unknownPinyin: "Wǒ yào yǒu xīwàng.",
    },
    {
        hanzi: "幽默",
        pinyin: "yōumò",
        desc: "나는 유머러스하다.",
        baseSentence: "我很幽默",
        basePinyin: "Wǒ hěn yōumò.",
        unknownDesc: "나는 유머러스하고 싶다.",
        unknownSentence: "我要幽默",
        unknownPinyin: "Wǒ yào yōumò.",
    },
    {
        hanzi: "信仰",
        pinyin: "xìnyǎng",
        desc: "나는 신앙이 깊다.",
        baseSentence: "我很有信仰",
        basePinyin: "Wǒ hěn yǒu xìnyǎng.",
        unknownDesc: "나는 깊은 신앙을 얻고 싶다.",
        unknownSentence: "我要有信仰",
        unknownPinyin: "Wǒ yào yǒu xìnyǎng.",
    },
]

export default function SpeakingSliderApp() {
  const [selectedStudent, setSelectedStudent] = React.useState("하현우")
  const [index, setIndex] = React.useState(0)
  const [isRecording, setIsRecording] = React.useState(false)
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const result = studentResults[selectedStudent as keyof typeof studentResults]
  const slides = React.useMemo(() => {
    const all: any[] = []
    for (const type of WINDOW_ORDER) {
      const hanziList = result[type as keyof typeof result] || []
      hanziList.forEach((hanzi: string) => {
        const data = strengths.find((s) => s.hanzi === hanzi)
        if (data) all.push({ ...data, windowType: type })
      })
    }
    return all
  }, [result])

  const current = slides[index]
  if (!current) return <div>결과 없음</div>

  let sentence = ""
  let pinyin = ""
  let meaning = ""

  if (current.windowType === "unknown") {
    sentence = current.unknownSentence
    pinyin = current.unknownPinyin
    meaning = current.unknownDesc
  } else {
    const prefix =
      current.windowType === "blind"
        ? "朋友说"
        : current.windowType === "hidden"
        ? "我觉得"
        : ""
    const pinyinPrefix =
      current.windowType === "blind"
        ? "Péngyou shuō "
        : current.windowType === "hidden"
        ? "Wǒ juéde "
        : ""

    sentence = prefix + current.baseSentence
    pinyin = pinyinPrefix + current.basePinyin
    meaning = current.desc
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        if (audioRef.current) {
          audioRef.current.src = url
          audioRef.current.play()
        }
        setMediaRecorder(null)
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch {
      alert("🎤 마이크 권한이 필요합니다.")
    }
  }

  const stopRecording = () => {
    mediaRecorder?.stop()
    setIsRecording(false)
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {/* 🔻 학생 선택 */}
      <select
        value={selectedStudent}
        onChange={(e) => {
          setSelectedStudent(e.target.value)
          setIndex(0)
        }}
        className="mb-2 px-3 py-2 border rounded"
      >
        {Object.keys(studentResults).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      {/* 🔷 진행 상태 바 */}
      <div className="flex justify-center gap-2 mb-4">
        {WINDOW_ORDER.map((type) => {
          const isActive = current.windowType === type
          const colorMap: Record<string, string> = {
            open: "bg-green-400",
            blind: "bg-blue-400",
            hidden: "bg-yellow-400",
            unknown: "bg-gray-400",
          }
          return (
            <div
              key={type}
              className={`px-4 py-1 rounded-full text-sm font-medium shadow-md transition-all duration-200 ${
                isActive
                  ? `${colorMap[type]} text-white scale-105`
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {WINDOW_LABELS[type]}
            </div>
          )
        })}
      </div>

      {/* 🖼 이미지 */}
      <img
        src={`https://raw.githubusercontent.com/hghdz/card-selector-app/main/images/${current.hanzi}.png`}
        alt={current.hanzi}
        className="w-64 h-64 object-contain"
      />

      {/* 📜 문장 */}
      <p className="text-xl font-bold text-red-500">{sentence}</p>
      <p className="text-base text-gray-600">{pinyin}</p>
      <p className="text-base text-gray-500">{meaning}</p>

      {/* 🎧 듣기 / 🎤 녹음 */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => {
            const utter = new SpeechSynthesisUtterance(sentence)
            utter.lang = "zh-CN"
            speechSynthesis.speak(utter)
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          🔊 듣기
        </button>

        <button
          onClick={() => (!mediaRecorder ? startRecording() : stopRecording())}
          className={`px-4 py-2 text-white rounded transition ${
            isRecording
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isRecording ? "⏹ 녹음 중지" : "🎙 녹음 시작"}
        </button>
      </div>

      <audio ref={audioRef} className="hidden" />

      {/* ◀️▶️ 슬라이드 이동 */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          ◀ 이전
        </button>
        <button
          onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다음 ▶
        </button>
      </div>
    </div>
  )
}