export const TODOS = 'todos'

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function correspondeBusca(busca: string, ...campos: (string | null | undefined)[]): boolean {
  const termo = normalizar(busca)
  if (!termo) return true
  return campos.some((campo) => campo != null && normalizar(campo).includes(termo))
}

export function correspondeFiltro(filtro: string, valor: string | null | undefined): boolean {
  return !filtro || filtro === TODOS || filtro === valor
}

export function descricaoContagem(
  mostrando: number,
  total: number,
  singular: string,
  plural: string,
  filtrando: boolean,
): string {
  const nome = total === 1 ? singular : plural
  return filtrando ? `Mostrando ${mostrando} de ${total} ${nome}` : `${total} ${nome}`
}
