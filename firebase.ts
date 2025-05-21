import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCPkxqIO8_gR4zUeC33FkLmahJuv7pArQg",
  authDomain: "meng-project-df8e1.firebaseapp.com",
  projectId: "meng-project-df8e1",
};

const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
