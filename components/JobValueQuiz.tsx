// components/JobValueQuiz.tsx
import React, { useState } from 'react';

export interface Question {
  image: string;
  textA: string;
  descA: string;
  textB: string;
  descB: string;
}

interface Props {
  questions: Question[];
  email: string;
  onStartSpeaking: (email: string) => void;
}

export default function JobValueQuiz({ questions, email, onStartSpeaking }: Props) {
  // …아까 구현했던 quiz + result 단계 로직…
  // 결과 단계 버튼만:
  return (
    <button onClick={() => onStartSpeaking(email)}>
      말하기 연습하러 가기
    </button>
  );
}
