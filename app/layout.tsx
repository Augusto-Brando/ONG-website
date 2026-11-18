import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import { Providers } from './providers'


export const metadata: Metadata = {
  title: 'Amor não tem Raça - Adoção de Animais',
  description: 'Conheça animais disponíveis para adoção e ajude a ONG Amor não tem Raça.',
  icons: {
    icon: [{ url: '/logo.svg', type: 'image/svg+xml' }],
    shortcut: [{ url: '/logo.svg', type: 'image/svg+xml' }],
    apple: '/logo.jpeg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Fontes da marca: Baloo 2 (títulos), Nunito (texto), Caveat (notas manuscritas) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Nunito:wght@400;600;800&family=Caveat:wght@600&display=swap"
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
        <Analytics />
      </body>
    </html>
  )
}
