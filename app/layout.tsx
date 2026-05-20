import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SalesCraft — Dachblick CRM',
  description: 'Internes CRM für Velux Dachfenster Leads',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontSize: '13px',
              border: '1px solid #ececec',
              boxShadow: 'none',
              borderRadius: '6px',
            },
          }}
        />
      </body>
    </html>
  )
}
