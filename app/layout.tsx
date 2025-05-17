import Navbar from '../components/navbar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <navbar />
        {children}
      </body>
    </html>
  )
}
