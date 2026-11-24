'use client'

// Painel gerencial: indicadores, gráficos e alertas em uma única tela.
// Cada seção só aparece se a API devolveu aquele bloco (perfil sem a área
// recebe `null` e a seção é omitida).
import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Dashboard } from '@/app/api/dashboard/route'
import { AdoptionFunnel } from '@/components/admin/painel/adoption-funnel'
import { DonationsChart } from '@/components/admin/painel/donations-chart'
import { FinanceChart } from '@/components/admin/painel/finance-chart'
import { KpiCards } from '@/components/admin/painel/kpi-cards'
import { LowStockList } from '@/components/admin/painel/low-stock-list'
import { UpcomingTreatments } from '@/components/admin/painel/upcoming-treatments'

export default function PainelPage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErro(false)
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData((await res.json()) as Dashboard)
      setUpdatedAt(
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      )
    } catch {
      setErro(true)
      toast.error('Não foi possível carregar os indicadores do painel.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const vazio =
    data !== null &&
    !data.animais &&
    !data.adocoes &&
    !data.doacoes &&
    !data.financeiro &&
    !data.estoque &&
    !data.tratamentos

  return (
    <AdminShell
      title="Painel"
      description={
        updatedAt
          ? `Visão geral dos animais, adoções, doações e do financeiro da ONG · atualizado às ${updatedAt}`
          : 'Visão geral dos animais, adoções, doações e do financeiro da ONG.'
      }
      actions={
        <Button variant="outline" size="sm" className="gap-2" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Atualizar
        </Button>
      }
    >
      {loading && !data ? (
        <div className="space-y-6" role="status" aria-label="Carregando indicadores do painel">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[0, 1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="h-[124px] animate-pulse rounded-xl border border-[var(--ant-areia)] bg-[var(--ant-esqueleto)]"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="h-72 animate-pulse rounded-xl border border-[var(--ant-areia)] bg-[var(--ant-esqueleto)] lg:col-span-2" />
            <div className="h-72 animate-pulse rounded-xl border border-[var(--ant-areia)] bg-[var(--ant-esqueleto)]" />
          </div>
        </div>
      ) : erro && !data ? (
        <div className="mx-auto max-w-md space-y-3 rounded-xl border border-[var(--ant-areia)] bg-[var(--ant-branco)] px-6 py-10 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--ant-erro-fundo)] text-[var(--ant-erro)]">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <p role="alert" className="text-sm font-medium text-[var(--ant-erro-texto-forte)]">
            Não foi possível carregar os indicadores do painel.
          </p>
          <Button variant="outline" size="sm" onClick={load}>
            Tentar novamente
          </Button>
        </div>
      ) : vazio ? (
        <p className="py-20 text-center text-muted-foreground">
          Nenhum indicador disponível para o seu perfil.
        </p>
      ) : data ? (
        <div className="space-y-6">
          <KpiCards data={data} />

          {(data.financeiro || data.adocoes) && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {data.financeiro && (
                <Card className="border-[var(--ant-areia)] bg-[var(--ant-branco)] lg:col-span-2">
                  <CardHeader>
                    <CardTitle as="h2" className="text-base text-[var(--ant-tinta)]">Receitas x despesas</CardTitle>
                    <CardDescription>Últimos 6 meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FinanceChart data={data.financeiro.porMes} />
                  </CardContent>
                </Card>
              )}

              {data.adocoes && (
                <Card className={`border-[var(--ant-areia)] bg-[var(--ant-branco)] ${data.financeiro ? '' : 'lg:col-span-3'}`}>
                  <CardHeader>
                    <CardTitle as="h2" className="text-base text-[var(--ant-tinta)]">Funil de adoções</CardTitle>
                    <CardDescription>Solicitações por etapa do processo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdoptionFunnel porEtapa={data.adocoes.porEtapa} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {(data.doacoes || data.estoque) && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {data.doacoes && (
                <Card className="border-[var(--ant-areia)] bg-[var(--ant-branco)]">
                  <CardHeader>
                    <CardTitle as="h2" className="text-base text-[var(--ant-tinta)]">Doações por mês</CardTitle>
                    <CardDescription>Últimos 6 meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DonationsChart data={data.doacoes.porMes} />
                  </CardContent>
                </Card>
              )}

              {data.estoque && (
                <Card className="border-[var(--ant-areia)] bg-[var(--ant-branco)]">
                  <CardHeader>
                    <CardTitle as="h2" className="text-base text-[var(--ant-tinta)]">Estoque baixo</CardTitle>
                    <CardDescription>
                      {data.estoque.abaixoDoMinimo.length} de {data.estoque.itens} itens abaixo do mínimo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LowStockList items={data.estoque.abaixoDoMinimo} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {data.tratamentos && (
            <Card className="border-[var(--ant-areia)] bg-[var(--ant-branco)]">
              <CardHeader>
                <CardTitle as="h2" className="text-base text-[var(--ant-tinta)]">Próximos tratamentos</CardTitle>
                <CardDescription>Agendamentos e retornos previstos para os próximos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingTreatments items={data.tratamentos.proximos} />
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </AdminShell>
  )
}
