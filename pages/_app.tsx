import Navbar from '../components/navbar'  // 경로는 상황에 따라 달라질 수 있음


import type { AppProps } from 'next/app'
import '../styles/globals.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
