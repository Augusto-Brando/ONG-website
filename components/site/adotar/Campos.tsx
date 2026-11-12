'use client'

// Campos do assistente de adoção: rótulo visível, erro com ícone e texto
// (nunca só cor) e opção em cartão para as escolhas de etapa.
import type { ReactNode } from 'react'
import type { CSSProperties } from 'react'

const rotuloEstilo: CSSProperties = {
  fontWeight: 800,
  fontSize: 'var(--ant-texto-sm)',
  color: 'var(--ant-tinta)',
}

const campoEstilo: CSSProperties = {
  width: '100%',
  minHeight: '52px',
  padding: '0 var(--ant-esp-4)',
  borderRadius: 'var(--ant-raio-campo)',
  border: '2px solid var(--ant-areia-forte)',
  background: 'var(--ant-branco)',
  color: 'var(--ant-tinta)',
  fontFamily: 'var(--ant-fonte-texto)',
  fontSize: 'var(--ant-texto-md)',
}

const ajudaEstilo: CSSProperties = {
  margin: 0,
  fontSize: 'var(--ant-texto-xs)',
  color: 'var(--ant-tinta-suave)',
}

/** Erro de campo: ícone, texto e `role="alert"`. */
export function ErroCampo({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-2"
      style={{ margin: 0, fontSize: 'var(--ant-texto-sm)', fontWeight: 700, color: 'var(--ant-erro)' }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--ant-erro)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        style={{ flex: 'none', marginTop: '2px' }}
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5" />
        <path d="M12 16h.01" />
      </svg>
      <span>{children}</span>
    </p>
  )
}

/** Campo de texto com rótulo, ajuda e erro. */
export function CampoTexto({
  id,
  rotulo,
  valor,
  onChange,
  tipo = 'text',
  erro,
  ajuda,
  obrigatorio = false,
  autoComplete,
  placeholder,
  maxLength,
  linhas,
}: {
  id: string
  rotulo: string
  valor: string
  onChange: (valor: string) => void
  tipo?: 'text' | 'tel' | 'email'
  erro?: string
  ajuda?: string
  obrigatorio?: boolean
  autoComplete?: string
  placeholder?: string
  maxLength?: number
  linhas?: number
}) {
  const descritoPor = erro ? `${id}-erro` : ajuda ? `${id}-ajuda` : undefined

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} style={rotuloEstilo}>
        {rotulo} {obrigatorio ? <span aria-hidden="true">*</span> : null}
      </label>

      {linhas ? (
        <textarea
          id={id}
          name={id}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          rows={linhas}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-invalid={erro ? true : undefined}
          aria-describedby={descritoPor}
          style={{ ...campoEstilo, padding: 'var(--ant-esp-3) var(--ant-esp-4)', minHeight: '120px' }}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={tipo}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-invalid={erro ? true : undefined}
          aria-describedby={descritoPor}
          style={campoEstilo}
        />
      )}

      {erro ? (
        <ErroCampo id={`${id}-erro`}>{erro}</ErroCampo>
      ) : ajuda ? (
        <p id={`${id}-ajuda`} style={ajudaEstilo}>
          {ajuda}
        </p>
      ) : null}
    </div>
  )
}

/** Opção em cartão: radio nativo com cartão desenhado ao redor. */
export function OpcaoCartao({
  name,
  value,
  selecionada,
  onSelect,
  titulo,
  descricao,
}: {
  name: string
  value: string
  selecionada: boolean
  onSelect: (valor: string) => void
  titulo: string
  descricao?: string
}) {
  return (
    <label
      className="flex cursor-pointer items-start gap-3"
      style={{
        padding: 'var(--ant-esp-4)',
        borderRadius: 'var(--ant-raio-campo)',
        border: `2px solid ${selecionada ? 'var(--ant-azul)' : 'var(--ant-areia-forte)'}`,
        background: selecionada ? 'var(--ant-azul-suave)' : 'var(--ant-branco)',
        minHeight: 'var(--ant-alvo-min)',
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selecionada}
        onChange={() => onSelect(value)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ant-azul)] mt-1 h-5 w-5 flex-none rounded-full border-2"
        style={{
          borderColor: selecionada ? 'var(--ant-azul)' : 'var(--ant-areia-forte)',
          background: selecionada ? 'var(--ant-azul)' : 'transparent',
          boxShadow: selecionada ? 'inset 0 0 0 4px var(--ant-azul-suave)' : 'none',
        }}
      />
      <span className="flex flex-col gap-1">
        <span style={{ fontWeight: 800, fontSize: 'var(--ant-texto-md)' }}>{titulo}</span>
        {descricao ? <span style={ajudaEstilo}>{descricao}</span> : null}
      </span>
    </label>
  )
}
