import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebase';  // 아래 3번에서 생성할 firebase.ts
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextValue {
  user: User | null;
}

export const AuthContext = createContext<AuthContextValue>({ user: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}
