import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })
const space = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
})
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
})

export const metadata = {
  title: 'IDEON — Command Center',
  description: 'Cognitive Command Center: the company operating system',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('cc_theme');if(t&&t!=='dark'&&t!=='light'){t='dark'}var d=t==='light'?'':'dark';document.documentElement.className=d||'dark'}catch(e){document.documentElement.className='dark'}})()`,
          }}
        />
      </head>
      <body
        className={`${inter.className} ${space.variable} ${mono.variable}`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}