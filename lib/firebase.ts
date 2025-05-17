// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app'

const firebaseConfig = {
  apiKey: "AIzaSyCPkxqIO8_gR4zUeC33FkLmahJuv7pArQg",
  authDomain: "meng-project-df8e1.firebaseapp.com",
  projectId: "meng-project-df8e1",
  storageBucket: "meng-project-df8e1.firebasestorage.app",
  messagingSenderId: "795749690902",
  appId: "1:795749690902:web:9c788a277e1c30254e0f37",
  measurementId: "G-1HMZYWKETJ"
}

// 이미 초기화된 앱이 없을 때만 실행
if (!getApps().length) {
  initializeApp(firebaseConfig)
}

console.log("🔥 Firebase initialized!")
