// src/components/JobValueQuiz.tsx
import React, { useState } from "react";

interface Question {
  image: string;
  textA: string;
  descA: string;
  textB: string;
  descB: string;
}

interface Props {
  questions: Question[];
  email: string;
}

export default function JobValueQuiz({ questions, email }: Props) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [stage, setStage] = useState<"quiz" | "result">("quiz");
  const q = questions[idx];

  const filenameMap: Record<string, string> = {
    능력발휘: "展现实力",
    보수: "收入高",
    안정성: "稳定性",
    "사회적 인정": "社会认可",
    "사회적 기여": "帮助别人",
    자기계발: "自我发展",
    창의성: "创造力",
    자율성: "自主权",
  };

  const handleNext = () => {
    if (!selected) return;
    const key = selected === "A" ? q.textA : q.textB;
    setCounts((c) => ({ ...c, [key]: (c[key] || 0) + 1 }));
    setSelected(null);
    if (idx < questions.length - 1) setIdx(idx + 1);
    else setStage("result");
  };

  const progressPercent = ((idx + 1) / questions.length) * 100;

  if (stage === "quiz") {
    return (
      <div style={{ width: "100%", textAlign: "center", padding: 16 }}>
        {/* …기존 quiz JSX… */}
      </div>
    );
  }

  // 결과 단계
  const entries = Object.entries(counts);
  const sorted = entries.sort(([, a], [, b]) => b - a);
  const grouped: { rank: number; items: string[]; count: number }[] = [];
  let prevCount: number | null = null;
  sorted.forEach(([key, c], i) => {
    if (c !== prevCount) {
      grouped.push({ rank: i + 1, items: [key], count: c });
      prevCount = c;
    } else grouped[grouped.length - 1].items.push(key);
  });
  const maxCount = grouped[0]?.count || 1;

  return (
    <div style={{ width: "100%", textAlign: "center", padding: 16 }}>
      {/* …기존 result JSX… */}
      <button
        onClick={async () => {
          const top3 = grouped
            .filter((g) => g.rank <= 3)
            .flatMap((g) => g.items);
          await fetch("/api/save-values", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, topValues: top3 }),
          });
          window.open(`/speaking/values?email=${encodeURIComponent(email)}`, "_blank");
        }}
      >
        말하기 연습하러 가기
      </button>
    </div>
  );
}
