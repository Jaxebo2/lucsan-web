import React from 'react'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './styles.css'

const cabinet = localFont({
  src: [
    { path: '../../../public/fonts/CabinetGrotesk-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../../public/fonts/CabinetGrotesk-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-cabinet',
  display: 'swap',
})

const switzer = localFont({
  src: [
    { path: '../../../public/fonts/Switzer-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/Switzer-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../../public/fonts/Switzer-Semibold.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-switzer',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lucsan Design',
  description: 'Estudio de diseño, publicidad y marketing.',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html className={`${cabinet.variable} ${switzer.variable}`}>
      <body>{children}</body>
    </html>
  )
}
