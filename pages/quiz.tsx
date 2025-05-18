// pages/quiz.tsx
import React from 'react';
import { useRouter } from 'next/router';
import JobValueQuiz, { Question } from '../components/JobValueQuiz';
import questions from '../src/data/questions';

export default function QuizPage() {
  const router = useRouter();
  const email = router.query.email as string;

  const startSpeaking = (email: string) => {
    window.open(`/speaking/values?email=${encodeURIComponent(email)}`, '_blank');
  };

  if (!email) return <p>이메일 정보가 없습니다.</p>;
  return <JobValueQuiz questions={questions as Question[]} email={email} onStartSpeaking={startSpeaking} />;
}
