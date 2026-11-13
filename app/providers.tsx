'use client'

// Tema do Astryx com a identidade da ONG. Modo escuro ainda não desenhado: fica em claro.
import Link from 'next/link'
import { Theme } from '@astryxdesign/core/theme'
import { LinkProvider } from '@astryxdesign/core/Link'
import { amorTheme } from '@/themes/amor/amor'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme={amorTheme} mode="light">
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  )
}
