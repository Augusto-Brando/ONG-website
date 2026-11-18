// Geração de CSV compatível com o Excel em português:
// - BOM (\uFEFF) para o Excel reconhecer UTF-8 e não estragar acentos;
// - separador ';' (o padrão do Excel pt-BR);
// - aspas duplas quando o valor tem ';', aspas ou quebra de linha;
// - proteção contra injeção de fórmula: valores de texto que começam com
//   '=', '+', '-' ou '@' recebem um apóstrofo na frente.

const FORMULA_START = /^[=+\-@]/
const NEEDS_QUOTES = /[";\r\n]/

function escapeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''

  // Números são gerados pelo sistema: não passam pela proteção de fórmula
  // (senão um valor negativo viraria texto).
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : ''

  let text = value
  if (FORMULA_START.test(text)) text = `'${text}`
  if (NEEDS_QUOTES.test(text)) text = `"${text.replaceAll('"', '""')}"`
  return text
}

/**
 * Monta o CSV completo (com BOM) a partir dos cabeçalhos e das linhas.
 * Linhas terminam em CRLF, como manda o RFC 4180.
 */
export function toCsv(headers: string[], rows: (string | number | null)[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(';'))
  return `\uFEFF${lines.join('\r\n')}`
}
