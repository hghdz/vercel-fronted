// pages/quiz.tsx
import { useRouter } from 'next/router'
import { JobValueQuiz } from '../components/JobValueQuiz'
import questions from '../src/data/questions'                  // JSON이나 JS로 정리해둔 28개 문항

export default function QuizPage() {
  const { query } = useRouter()
  const email = Array.isArray(query.email) ? query.email[0] : query.email || ''

  return (
    <div>
      {/* Navbar, 헤더 등 레이아웃이 필요하면 여기 */}
      <JobValueQuiz questions={questions} email={email} />
    </div>
  )
}
