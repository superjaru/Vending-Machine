import type { Metadata } from 'next'
import { Space_Mono, DM_Sans, Geist } from 'next/font/google'
import { JotaiProvider } from '@/components/providers/JotaiProvider'
import './globals.css'
import { cn } from "@/lib/utils";

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
})

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

export const metadata: Metadata = {
  title: 'Blue Vending Machine',
  description: 'Simple Vending Machine for SMEs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(spaceMono.variable, "font-sans", geist.variable)}>
      <body className="font-sans antialiased">
        <JotaiProvider>{children}</JotaiProvider>
      </body>
    </html>
  )
}
