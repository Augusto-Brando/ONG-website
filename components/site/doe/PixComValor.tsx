'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import QRCode from 'qrcode'
import { VStack, HStack } from '@astryxdesign/core/Stack'
import { AlertTriangle, Check } from 'lucide-react'
import { Botao } from '@/components/marca/Botao'
import { Chip } from '@/components/marca/Etiqueta'
import { formatMoney } from '@/lib/format'
import { gerarPixCopiaECola, novoTxid, PIX_ONG } from '@/lib/pix'

type Codigo = { valor: number; txid: string; texto: string; imagem: string }
const campo = 'min-h-12 w-full min-w-0 rounded-(--ant-raio-campo) border-2 border-(--ant-areia-forte) bg-(--ant-branco) px-3 text-(--ant-tinta)'

export function PixComValor({ campanha, variante = 'claro' }: {
  campanha?: { id: number; title: string }
  variante?: 'claro' | 'escuro'
}) {
  const id = useId()
  const [outro, setOutro] = useState('')
  const [codigo, setCodigo] = useState<Codigo | null>(null)
  const [gerando, setGerando] = useState(false)
  const [avisar, setAvisar] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [copiaManual, setCopiaManual] = useState(false)
  const [erro, setErro] = useState('')
  const emAndamento = useRef(false)
  const secundario = variante === 'escuro' ? 'azul' : 'contorno'

  async function gerar(valor: number) {
    if (emAndamento.current) return
    setErro('')
    if (!Number.isFinite(valor) || valor < 1 || valor > 100000) {
      setErro('Informe um valor entre R$ 1,00 e R$ 100.000,00, com até duas casas decimais.')
      return
    }
    emAndamento.current = true
    setGerando(true)
    setCodigo(null)
    setAvisar(false)
    setEnviado(false)
    setCopiado(false)
    setCopiaManual(false)
    try {
      const txid = novoTxid()
      const texto = gerarPixCopiaECola({ valor, txid, descricao: campanha?.title })
      const imagem = await QRCode.toDataURL(texto, { margin: 1, errorCorrectionLevel: 'M' })
      setCodigo({ valor, txid, texto, imagem })
    } catch {
      setErro('Não foi possível gerar o código Pix. Tente de novo.')
    } finally {
      emAndamento.current = false
      setGerando(false)
    }
  }

  function gerarOutro(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void gerar(/^\d+(?:[,.]\d{1,2})?$/.test(outro.trim()) ? Number(outro.trim().replace(',', '.')) : NaN)
  }

  async function copiar() {
    if (!codigo) return
    setCopiado(false)
    try {
      await navigator.clipboard.writeText(codigo.texto)
      setCopiado(true)
      setCopiaManual(false)
    } catch {
      setCopiaManual(true)
    }
  }

  async function informar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!codigo || emAndamento.current) return
    const dados = new FormData(e.currentTarget)
    emAndamento.current = true
    setEnviando(true)
    setErro('')
    try {
      const res = await fetch('/api/public/doacao-pix', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: codigo.valor, txid: codigo.txid, campaignId: campanha?.id,
          nome: String(dados.get('nome') || '').trim(), email: String(dados.get('email') || '').trim(),
          website: String(dados.get('website') || '') }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Não foi possível avisar agora. Seus dados foram mantidos. Tente de novo.')
      }
      setEnviado(true)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'A conexão falhou. Tente de novo.')
    } finally {
      emAndamento.current = false
      setEnviando(false)
    }
  }

  return <VStack gap={4} className={`min-w-0 ${variante === 'escuro' ? 'text-(--ant-branco)' : 'text-(--ant-tinta)'}`}>
    <p>Escolha quanto quer doar. O total da campanha é atualizado depois da confirmação da equipe.</p>
    <HStack gap={2} wrap="wrap" aria-label="Valores de doação">
      {[20, 50, 100, 200].map(valor => <Chip key={valor} pressed={codigo?.valor === valor} desabilitado={gerando || enviando} onClick={() => { setOutro(''); void gerar(valor) }}>R$ {valor}</Chip>)}
    </HStack>
    <form onSubmit={gerarOutro}><VStack gap={3}>
      <label htmlFor={`${id}-valor`} className="font-extrabold">Outro valor (R$)</label>
      <input id={`${id}-valor`} className={campo} inputMode="decimal" value={outro} disabled={gerando || enviando} onChange={e => { setOutro(e.target.value); setCodigo(null); setErro(''); setEnviado(false) }} placeholder="35,50" required aria-describedby={`${id}-limite`} />
      <p id={`${id}-limite`} className="text-sm">Mínimo de R$ 1,00. Até R$ 100.000,00.</p>
      <Botao type="submit" variacao={codigo ? secundario : 'azul'} carregando={gerando} rotuloCarregando="Gerando Pix…" disabled={enviando}>Gerar código Pix</Botao>
    </VStack></form>
    {codigo && <VStack gap={4}>
      <p role="status" className="font-extrabold">{formatMoney(codigo.valor)} para Amor Não Tem Raça</p>
      <VStack hAlign="center" className="self-center rounded-(--ant-raio-cartao) bg-(--ant-branco) p-4">
        <img src={codigo.imagem} alt={`QR Code Pix de ${formatMoney(codigo.valor)} para Amor Não Tem Raça`} className="h-auto w-64 max-w-full" />
      </VStack>
      <Botao variacao={avisar || enviado ? secundario : 'acao'} onClick={copiar}>Copiar código Pix</Botao>
      {copiado && <p role="status"><Check className="inline" size={20} aria-hidden="true" /> Código copiado! Cole no app do seu banco.</p>}
      {copiaManual && <VStack gap={2}><p role="status">Selecione e copie o código abaixo.</p><label htmlFor={`${id}-codigo`}>Pix copia e cola</label><textarea id={`${id}-codigo`} className={`${campo} break-all py-3`} value={codigo.texto} readOnly onFocus={e => e.target.select()} /></VStack>}
      {!enviado && !avisar && <Botao variacao={secundario} onClick={() => { setAvisar(true); setErro('') }}>Já fez o Pix? Avise a gente</Botao>}
      {avisar && !enviado && <form onSubmit={informar}><VStack gap={3}>
        <label htmlFor={`${id}-nome`}>Nome (opcional)</label>
        <input id={`${id}-nome`} name="nome" autoComplete="name" maxLength={120} className={campo} disabled={enviando} />
        <label htmlFor={`${id}-email`}>E-mail (opcional)</label>
        <input id={`${id}-email`} name="email" type="email" autoComplete="email" maxLength={254} className={campo} disabled={enviando} />
        <label hidden htmlFor={`${id}-website`}>Site<input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" /></label>
        <Botao type="submit" tamanho="grande" carregando={enviando} rotuloCarregando="Avisando a equipe…">Já fiz o Pix</Botao>
      </VStack></form>}
      {enviado && <p role="status">Obrigado! Assim que a equipe confirmar no extrato, sua doação entra na campanha.</p>}
    </VStack>}
    {erro && <p role="alert"><AlertTriangle className="inline" size={20} aria-hidden="true" /> {erro}</p>}
    <p className="break-words text-sm">Prefere usar a chave? CNPJ: <strong>{PIX_ONG.chaveFormatada}</strong></p>
  </VStack>
}
