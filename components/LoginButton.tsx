import React, { useContext } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { AuthContext } from '../contexts/AuthContext';

export function LoginButton() {
  const { user } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error('로그인 실패:', e);
    }
  };

  if (user) {
    return <span>안녕하세요, {user.displayName}님!</span>;
  }
  return <button onClick={handleLogin}>Google로 로그인</button>;
}
