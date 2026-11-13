import type { ReactNode } from 'react'
import { BarraAcaoCelular } from './BarraAcaoCelular'
import { Cabecalho } from './Cabecalho'
import { PularConteudo } from './PularConteudo'
import { Rodape } from './Rodape'

/**
 * Casca do site público: link "Pular para o conteúdo", cabeçalho, `<main id="conteudo">`,
 * rodapé e a barra fixa de ação no celular. O `main` reserva espaço para a barra
 * para nenhum conteúdo ficar escondido atrás dela.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        maxWidth: '100%',
        minWidth: 0,
        overflowX: 'clip',
        background: 'var(--ant-creme)',
      }}
    >
      <PularConteudo destino="conteudo" />

      <Cabecalho />

      <main id="conteudo" style={{ flex: 1, minWidth: 0 }} className="pb-28 md:pb-0">
        {children}
      </main>

      <Rodape />
      <BarraAcaoCelular />
    </div>
  )
}
