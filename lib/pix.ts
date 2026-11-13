// Pix estático com valor ("BR Code"), padrão EMV do Banco Central (Manual de Padrões para Iniciação do Pix).
// Gera o texto do "Pix copia e cola", que também vira o QR Code. Não depende de banco nem de API:
// o pagamento cai direto na chave da ONG. A confirmação é feita pela equipe no painel.

export const PIX_ONG = {
  chave: '48118169000177', // CNPJ 48.118.169/0001-77, só dígitos
  nome: 'AMOR NAO TEM RACA', // até 25 caracteres, sem acento
  cidade: 'JUIZ DE FORA', // até 15 caracteres, sem acento
  chaveFormatada: '48.118.169/0001-77', // para exibir (os bancos aceitam com ou sem pontuação)
} as const

function campo(id: string, valor: string): string {
  if (valor.length > 99) throw new Error(`Campo Pix ${id} longo demais`)
  return id + String(valor.length).padStart(2, '0') + valor
}

/** Remove acentos e caracteres fora do conjunto permitido pelo BR Code. */
export function limparTextoPix(texto: string, max: number): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .toUpperCase()
    .slice(0, max)
}

/** CRC16-CCITT-FALSE (polinômio 0x1021, inicial 0xFFFF), 4 dígitos hexadecimais maiúsculos. */
export function crc16(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/** Identificador da transação: só letras e números, até 25 caracteres. Ajuda a achar o Pix no extrato. */
export function novoTxid(prefixo = 'ANTR'): string {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  const bytes = new Uint8Array(10)
  crypto.getRandomValues(bytes)
  for (const b of bytes) s += alfabeto[b % alfabeto.length]
  return (prefixo + s).slice(0, 25)
}

export type OpcoesPix = {
  valor: number // em reais, > 0
  txid: string
  descricao?: string // aparece no app de alguns bancos (ex.: nome da campanha)
}

/** Monta o "Pix copia e cola" com valor. */
export function gerarPixCopiaECola({ valor, txid, descricao }: OpcoesPix): string {
  if (!Number.isFinite(valor) || valor <= 0 || valor > 100000) throw new Error('Valor Pix inválido')
  const txidLimpo = txid.replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***'
  const info =
    campo('00', 'br.gov.bcb.pix') +
    campo('01', PIX_ONG.chave) +
    (descricao ? campo('02', limparTextoPix(descricao, 40)) : '')
  const payload =
    campo('00', '01') +
    campo('26', info) +
    campo('52', '0000') +
    campo('53', '986') +
    campo('54', valor.toFixed(2)) +
    campo('58', 'BR') +
    campo('59', limparTextoPix(PIX_ONG.nome, 25)) +
    campo('60', limparTextoPix(PIX_ONG.cidade, 15)) +
    campo('62', campo('05', txidLimpo)) +
    '6304'
  return payload + crc16(payload)
}
