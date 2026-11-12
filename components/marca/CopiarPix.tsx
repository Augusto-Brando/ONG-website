'use client'

import { useEffect, useRef, useState } from 'react'
import type { EstiloMarca } from './css'

/** Chave Pix oficial da ONG (ver reference/conteudo.md). */
export const CHAVE_PIX = '48.118.169/0001-77'

/**
 * Chave Pix em destaque com botão "Copiar chave Pix".
 * Ao copiar: botão vira azul-escuro com ícone de certo e rótulo "Chave copiada!" por 2,8 s,
 * e uma região `role="status"` agradece. Se a cópia falhar, seleciona a chave e pede Ctrl+C.
 */
export function CopiarPix({ chave = CHAVE_PIX }: { chave?: string }) {
  const [estado, setEstado] = useState<'parado' | 'copiado' | 'falhou'>('parado')
  const chaveRef = useRef<HTMLSpanElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  async function copiar() {
    try {
      await navigator.clipboard.writeText(chave)
      setEstado('copiado')
    } catch {
      const sel = window.getSelection()
      if (chaveRef.current && sel) {
        const r = document.createRange()
        r.selectNodeContents(chaveRef.current)
        sel.removeAllRanges()
        sel.addRange(r)
      }
      setEstado('falhou')
    }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setEstado('parado'), 2800)
  }

  const copiado = estado === 'copiado'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ant-esp-3)' }}>
      <span style={{ fontSize: 'var(--ant-texto-sm)', fontWeight: 600, color: 'var(--ant-tinta-suave)' }}>
        Chave Pix (CNPJ)
      </span>
      <span
        ref={chaveRef}
        style={{
          fontFamily: 'var(--ant-fonte-titulo)',
          fontWeight: 800,
          fontSize: 'var(--ant-titulo-sm)',
          lineHeight: 1.1,
          wordBreak: 'break-word',
        }}
      >
        {chave}
      </span>
      <button
        type="button"
        onClick={copiar}
        className="ant-botao ant-botao--acao"
        style={
          {
            minHeight: 'var(--ant-alvo-principal)',
            padding: '0 var(--ant-esp-5)',
            borderRadius: 'var(--ant-raio-pilula)',
            border: 0,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--ant-esp-2)',
            fontFamily: 'var(--ant-fonte-texto)',
            fontWeight: 800,
            fontSize: 'var(--ant-texto-md)',
            background: copiado ? 'var(--ant-azul-escuro)' : 'var(--ant-acao)',
            color: copiado ? 'var(--ant-branco)' : 'var(--ant-tinta)',
            boxShadow: copiado ? 'var(--ant-sombra-md)' : 'var(--ant-sombra-degrau)',
          } as EstiloMarca
        }
      >
        {copiado && (
          <svg
            className="ant-aparecer"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M5 12l5 5 9-10" />
          </svg>
        )}
        {copiado ? 'Chave copiada!' : 'Copiar chave Pix'}
      </button>
      <p
        role="status"
        style={{
          margin: 0,
          minHeight: '22px',
          fontWeight: 800,
          fontSize: 'var(--ant-texto-sm)',
          color: 'var(--ant-azul-texto-suave)',
        }}
      >
        {estado === 'copiado' && 'Cole no app do seu banco. Obrigado por ajudar!'}
        {estado === 'falhou' && 'Copie a chave selecionada.'}
      </p>
    </div>
  )
}
