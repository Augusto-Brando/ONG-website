import { BotaoLink } from '@/components/marca/Botao'

/**
 * Barra fixa de ação no celular: "Quero adotar" (laranja, ação) e "Doar" (azul de contorno),
 * dividindo a largura. Só aparece abaixo de 768 px, com área segura do iPhone.
 * No desktop ela não existe: o cabeçalho já traz o "Doar".
 */
export function BarraAcaoCelular() {
  return (
    <div
      className="md:hidden"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        background: 'var(--ant-creme)',
        borderTop: '1px solid var(--ant-areia)',
        boxShadow: 'var(--ant-sombra-lg)',
        padding: 'var(--ant-esp-2) var(--ant-gutter)',
        paddingBottom: 'calc(var(--ant-esp-2) + env(safe-area-inset-bottom))',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--ant-esp-2)' }}>
        <BotaoLink href="/animais" variacao="acao" tamanho="padrao" style={{ flex: 1 }}>
          Quero adotar
        </BotaoLink>
        <BotaoLink href="/doe" variacao="contorno" tamanho="padrao" style={{ flex: 1, background: 'var(--ant-creme)' }}>
          Doar
        </BotaoLink>
      </div>
    </div>
  )
}
