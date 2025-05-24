// components/MyPage.tsx
import * as React from 'react'
import { useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

type UserResults = {
  mbti?: { type: string }
  strengths?: { quadrantData: Record<string,string[]> }
  values?: { topValues: string[] }
  holland?: { types: string[] }
  jobs?: { chinese: string; pinyin: string; meaning: string }[]
  summaries?: { content: string }
}

const BASE_URL = 'https://raw.githubusercontent.com/hghdz/card-selector-app/main/images'
const letterMap: Record<string,string> = {
  E: "外向", I: "内向",
  S: "感觉", N: "直觉",
  F: "情感", T: "思考",
  J: "判断", P: "知觉",
}

export default function MyPage() {
  const [email, setEmail]     = useState<string|null>(null)
  const [results, setResults] = useState<UserResults|null>(null)
  const [loading, setLoading] = useState(true)

  // 1) 로그인된 사용자 이메일 구하기
  useEffect(() => {
    const auth = getAuth()
    return onAuthStateChanged(auth, user => {
      if (user?.email) setEmail(user.email)
    })
  }, [])

  // 2) email 생기면 API 한 번 호출
  useEffect(() => {
    if (!email) return
    fetch(`/api/get-user-results?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then((json: UserResults) => setResults(json))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [email])

  if (loading) return <p>로딩 중…</p>
  if (!results) return <p>결과가 없습니다.</p>

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 16 }}>
      <h1>나의 마이페이지</h1>

      {/* 1. MBTI */}
      {results.mbti?.type && (
        <section style={{ margin: '24px 0', textAlign: 'center' }}>
          <h2>MBTI 검사 결과</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            {results.mbti.type.split('').map(letter => {
              const nameZh = letterMap[letter] || letter
              const src    = `${BASE_URL}/${nameZh}.png`
              return (
                <img
                  key={letter}
                  src={src}
                  alt={`${letter}(${nameZh})`}
                  style={{ width: 80, height: 80 }}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* 2. 조하리의 창(강점) */}
      {results.strengths?.quadrantData && (
        <section style={{ margin: '24px 0' }}>
          <h2>강점 검사 (조하리의 창)</h2>
          {Object.entries(results.strengths.quadrantData).map(([quad, items]) => (
            <div key={quad} style={{ marginBottom: 8 }}>
              <strong>{quad}</strong>: {items.join(', ')}
            </div>
          ))}
        </section>
      )}

      {/* 3. 직업 가치관 */}
      {results.values?.topValues && (
        <section style={{ margin: '24px 0' }}>
          <h2>직업 가치관</h2>
          <p>{results.values.topValues.join(', ')}</p>
        </section>
      )}

      {/* 4. 홀랜드 흥미 유형 */}
      {results.holland?.types && (
        <section style={{ margin: '24px 0' }}>
          <h2>홀랜드 흥미 유형</h2>
          <p>{results.holland.types.join(', ')}</p>
        </section>
      )}

      {/* 5. 직업 탐색 보고서 */}
      {results.summaries?.content && (
        <section style={{ margin: '24px 0' }}>
          <h2>직업 탐색 보고서</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{results.summaries.content}</pre>
        </section>
      )}

      {/* 6. 탐색한 직업 리스트 */}
      {results.jobs?.length ? (
        <section style={{ margin: '24px 0' }}>
          <h2>탐색한 직업 명</h2>
          <ul>
            {results.jobs.map((job, i) => (
              <li key={i}>
                {job.chinese} ({job.pinyin}) — {job.meaning}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
