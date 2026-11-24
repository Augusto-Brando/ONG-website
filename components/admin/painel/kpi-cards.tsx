'use client'

// Cartões de indicadores do topo do painel. Cada um leva ao módulo correspondente.
// Cartões cujo bloco veio `null` (perfil sem a área) simplesmente não aparecem.
import Link from 'next/link'
import { AlertTriangle, ArrowUpRight, HandCoins, HeartHandshake, PawPrint, Wallet, type LucideIcon } from 'lucide-react'
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
              className="group flex h-full min-h-[124px] flex-col justify-between gap-2 rounded-xl border border-[var(--ant-areia)] bg-[var(--ant-branco)] p-4 shadow-sm transition-all hover:border-[var(--ant-azul)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-[var(--ant-tinta-suave)]">{card.label}</span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    card.negative
                      ? 'bg-[var(--ant-erro-fundo)] text-[var(--ant-erro)]'
                      : 'bg-[var(--ant-azul-suave)] text-[var(--ant-azul)]'
                  }`}
                  aria-hidden="true"
                >
                  <card.icon className="h-4 w-4" />
                </span>
              </span>
              <span
                className={`text-2xl font-bold tracking-tight tabular-nums ${
                  card.negative ? 'text-[var(--ant-erro)]' : 'text-[var(--ant-tinta)]'
                }`}
              >
                {card.value}
              </span>
              <span className="flex items-center justify-between gap-1 text-xs text-[var(--ant-tinta-suave)]">
                <span className="truncate">{card.detail}</span>
                <ArrowUpRight
                  className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 text-[var(--ant-azul)]"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
