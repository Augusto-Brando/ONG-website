// Rótulos curtos usados nos eixos dos gráficos: 'AAAA-MM' → 'MM/AA'.
export function monthLabel(mes: string): string {
  const [ano, mesNumero] = mes.split('-')
  return `${mesNumero}/${ano.slice(2)}`
}

/** Nome do mês por extenso, para os textos alternativos dos gráficos. */
export function monthLongLabel(mes: string): string {
  const [ano, mesNumero] = mes.split('-').map(Number)
  return new Date(ano, (mesNumero ?? 1) - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
}
