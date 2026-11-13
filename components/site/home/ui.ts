import type { CSSProperties } from 'react'

/** Largura máxima do conteúdo com o gutter da marca (16 px no celular, 40 px no desktop). */
export const larguraMax: CSSProperties = {
  width: '100%',
  maxWidth: 'var(--ant-largura-max)',
  margin: '0 auto',
  padding: '0 var(--ant-gutter)',
}

/** Respiro vertical das seções: 48 px no celular, até 88 px no desktop. */
export const secao: CSSProperties = {
  paddingTop: 'clamp(var(--ant-esp-7), 6vw, var(--ant-esp-9))',
  paddingBottom: 'clamp(var(--ant-esp-7), 6vw, var(--ant-esp-9))',
}

/** Título de seção: Baloo 2 800, 36 px no celular e 52 px no desktop. */
export const tituloSecao: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--ant-fonte-titulo)',
  fontWeight: 800,
  fontSize: 'clamp(var(--ant-titulo-md), 5vw, var(--ant-titulo-lg))',
  lineHeight: 1,
  color: 'var(--ant-tinta)',
  textWrap: 'balance',
}

/** Linha de apoio abaixo do título de seção. */
export const subtitulo: CSSProperties = {
  margin: 'var(--ant-esp-2) 0 0',
  maxWidth: '58ch',
  color: 'var(--ant-tinta-suave)',
  fontSize: 'var(--ant-texto-md)',
  lineHeight: 1.5,
}

/** Cartão claro padrão (branco, raio grande, sombra baixa). */
export const cartao: CSSProperties = {
  background: 'var(--ant-branco)',
  borderRadius: 'var(--ant-raio-cartao)',
  boxShadow: 'var(--ant-sombra-sm)',
}

/** Título dentro de cartão ou passo. */
export const tituloCartao: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--ant-fonte-titulo)',
  fontWeight: 800,
  fontSize: 'var(--ant-titulo-sm)',
  lineHeight: 1.1,
  color: 'var(--ant-tinta)',
}

/** Texto de apoio dentro de cartão. */
export const textoCartao: CSSProperties = {
  margin: 'var(--ant-esp-2) 0 0',
  color: 'var(--ant-tinta-suave)',
  fontSize: 'var(--ant-texto-sm)',
  lineHeight: 1.5,
}

/** Link de texto em azul com alvo de toque de 44 px. */
export const linkAzul: CSSProperties = {
  color: 'var(--ant-azul)',
  fontWeight: 800,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 'var(--ant-alvo-min)',
}
