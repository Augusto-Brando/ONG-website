'use client'

// Cartões de indicadores do topo do painel. Cada um leva ao módulo correspondente.
// Cartões cujo bloco veio `null` (perfil sem a área) simplesmente não aparecem.
import Link from 'next/link'
import { AlertTriangle, HandCoins, HeartHandshake, PawPrint, Wallet, type LucideIcon } from 'lucide-react'
import { formatMoney } from '@/lib/format'
import type { Dashboard } from '@/app/api/dashboard/route'

type Kpi = {
  href: string
  label: string
  value: string
  detail: string
  icon: LucideIcon
  negative?: boolean
}

const inteiro = (n: number) => n.toLocaleString('pt-BR')

export function KpiCards({ data }: { data: Dashboard }) {
  const cards: Kpi[] = []

  if (data.animais) {
    cards.push({
      href: '/admin',
      label: 'Animais disponíveis',
      value: inteiro(data.animais.disponiveis),
      detail: `${inteiro(data.animais.total)} cadastrados · ${inteiro(data.animais.adotados)} adotados`,
      icon: PawPrint,
    })
  }

  if (data.adocoes) {
    cards.push({
      href: '/admin/adocoes',
      label: 'Adoções abertas',
      value: inteiro(data.adocoes.abertas),
      detail: `${inteiro(data.adocoes.concluidasNoMes)} concluídas no mês`,
      icon: HeartHandshake,
    })
  }

  if (data.doacoes) {
    cards.push({
      href: '/admin/doacoes',
      label: 'Doações do mês',
      value: formatMoney(data.doacoes.totalMes),
      detail: `${inteiro(data.doacoes.quantidadeMes)} doação(ões) recebida(s)`,
      icon: HandCoins,
    })
  }

  if (data.financeiro) {
    cards.push({
      href: '/admin/financeiro',
      label: 'Saldo do mês',
      value: formatMoney(data.financeiro.saldoMes),
      detail: `Receitas ${formatMoney(data.financeiro.receitasMes)} · Despesas ${formatMoney(data.financeiro.despesasMes)}`,
      icon: Wallet,
      negative: data.financeiro.saldoMes < 0,
    })
  }

  if (data.estoque) {
    cards.push({
      href: '/admin/estoque',
      label: 'Itens com estoque baixo',
      value: inteiro(data.estoque.abaixoDoMinimo.length),
      detail: `de ${inteiro(data.estoque.itens)} itens no estoque`,
      icon: AlertTriangle,
      negative: data.estoque.abaixoDoMinimo.length > 0,
    })
  }

  if (cards.length === 0) return null

  return (
    <section aria-label="Indicadores do painel">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className="flex h-full flex-col gap-1 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <card.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              </span>
              <span
                className={`text-2xl font-bold ${card.negative ? 'text-destructive' : 'text-foreground'}`}
              >
                {card.value}
              </span>
              <span className="text-xs text-muted-foreground">{card.detail}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
