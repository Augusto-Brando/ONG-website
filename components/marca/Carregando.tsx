/**
 * Estado de carregando: cartões fantasma (`.ant-esqueleto`) na mesma forma do conteúdo
 * e a nota manuscrita "Procurando os focinhos…" anunciada por `role="status"`.
 */
export function Carregando({ cartoes = 3, rotulo = 'Procurando os focinhos…' }: { cartoes?: number; rotulo?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ant-esp-4)' }}>
      <p role="status" className="ant-mao" style={{ margin: 0, fontSize: 'var(--ant-mao-md)' }}>
        {rotulo}
      </p>
      <ul
        aria-hidden="true"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 'var(--ant-esp-4)',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {Array.from({ length: cartoes }, (_, i) => (
          <li key={i} style={{ borderRadius: 'var(--ant-raio-cartao)', padding: '10px', background: 'var(--ant-branco)' }}>
            <div className="ant-esqueleto" style={{ aspectRatio: '4 / 5', borderRadius: '20px' }} />
            <div className="ant-esqueleto" style={{ height: '18px', marginTop: '10px', borderRadius: 'var(--ant-raio-pilula)' }} />
            <div
              className="ant-esqueleto"
              style={{ height: '12px', width: '60%', marginTop: '8px', borderRadius: 'var(--ant-raio-pilula)' }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
