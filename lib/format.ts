// Formatação e rótulos em pt-BR compartilhados pelas telas do painel.

export function formatMoney(value: string | number | null | undefined): string {
  const n = Number(value ?? 0)
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** 'AAAA-MM-DD' (ou Date/ISO) → 'DD/MM/AAAA', sem deslocar o fuso. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const iso = value instanceof Date ? value.toISOString() : value
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export function todayIso(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const STAGE_LABELS: Record<string, string> = {
  novo: 'Novo',
  triagem: 'Triagem',
  entrevista: 'Entrevista',
  visita: 'Visita',
  aprovado: 'Aprovado',
  adotado: 'Adotado',
  pos_adocao: 'Pós-adoção',
  recusado: 'Recusado',
  desistiu: 'Desistiu',
}

export const LABELS: Record<string, string> = {
  // animais
  cao: 'Cão',
  gato: 'Gato',
  macho: 'Macho',
  femea: 'Fêmea',
  indefinido: 'Indefinido',
  disponivel: 'Disponível',
  em_tratamento: 'Em tratamento',
  em_processo: 'Em processo de adoção',
  adotado: 'Adotado',
  indisponivel: 'Indisponível',
  // tratamentos
  vacina: 'Vacina',
  vermifugo: 'Vermífugo',
  castracao: 'Castração',
  consulta: 'Consulta',
  medicacao: 'Medicação',
  cirurgia: 'Cirurgia',
  exame: 'Exame',
  agendado: 'Agendado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
  // estoque
  racao: 'Ração',
  medicamento: 'Medicamento',
  higiene: 'Higiene',
  limpeza: 'Limpeza',
  acessorio: 'Acessório',
  entrada: 'Entrada',
  saida: 'Saída',
  // doações e financeiro
  dinheiro: 'Dinheiro',
  material: 'Material',
  pix: 'Pix',
  transferencia: 'Transferência',
  cartao: 'Cartão',
  receita: 'Receita',
  despesa: 'Despesa',
  // CRM
  site: 'Site',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  evento: 'Evento',
  nota: 'Nota',
  ligacao: 'Ligação',
  email: 'E-mail',
  visita: 'Visita',
  mudanca_etapa: 'Mudança de etapa',
  // perfis
  admin: 'Administrador',
  voluntario: 'Voluntário',
  financeiro: 'Financeiro',
  outro: 'Outro',
}

export const label = (key: string | null | undefined) => (key ? (LABELS[key] ?? key) : '—')
