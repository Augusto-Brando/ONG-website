'use client'

// Painel gerencial: indicadores, gráficos e alertas em uma única tela.
// Cada seção só aparece se a API devolveu aquele bloco (perfil sem a área
// recebe `null` e a seção é omitida).
import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
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

  const load = useCallback(async () => {
    setLoading(true)
    setErro(false)
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData((await res.json()) as Dashboard)
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
      description="Visão geral dos animais, adoções, doações e do financeiro da ONG."
      actions={
        <Button variant="outline" size="sm" className="gap-2" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Atualizar
        </Button>
      }
    >
      {loading && !data ? (
        <p className="py-20 text-center text-muted-foreground">Carregando indicadores...</p>
      ) : erro && !data ? (
        <div className="space-y-3 py-20 text-center">
          <p className="text-muted-foreground">Não foi possível carregar os indicadores.</p>
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
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Receitas x despesas</CardTitle>
                    <CardDescription>Últimos 6 meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FinanceChart data={data.financeiro.porMes} />
                  </CardContent>
                </Card>
              )}

              {data.adocoes && (
                <Card className={data.financeiro ? '' : 'lg:col-span-3'}>
                  <CardHeader>
                    <CardTitle className="text-base">Funil de adoções</CardTitle>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Doações por mês</CardTitle>
                    <CardDescription>Últimos 6 meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DonationsChart data={data.doacoes.porMes} />
                  </CardContent>
                </Card>
              )}

              {data.estoque && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Estoque baixo</CardTitle>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Próximos tratamentos</CardTitle>
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
