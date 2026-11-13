'use client'

// Cartões de campanhas: período, progresso da meta e ações de edição/encerramento.
import { Pencil, Square } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatDate, formatMoney } from '@/lib/format'
import type { CampaignRow } from './types'

function period(campaign: CampaignRow): string {
  const inicio = formatDate(campaign.startDate)
  const fim = campaign.endDate ? formatDate(campaign.endDate) : 'sem data final'
  return `${inicio} até ${fim}`
}

export function CampaignCards({
  campaigns,
  loading,
  onEdit,
  onEnd,
}: {
  campaigns: CampaignRow[]
  loading: boolean
  onEdit: (campaign: CampaignRow) => void
  onEnd: (campaign: CampaignRow) => void
}) {
  if (loading) {
    return <p className="py-20 text-center text-muted-foreground">Carregando...</p>
  }

  if (campaigns.length === 0) {
    return (
      <p className="py-20 text-center text-muted-foreground">Nenhuma campanha cadastrada.</p>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {campaigns.map((campaign) => {
        const meta = campaign.goalAmount ?? 0
        const percentual = meta > 0 ? Math.min(100, Math.round((campaign.raised / meta) * 100)) : 0
        const doacoes = campaign.donationsCount === 1 ? 'doação' : 'doações'

        return (
          <li key={campaign.id}>
            <Card className="flex h-full flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{campaign.title}</CardTitle>
                  <Badge variant={campaign.active ? 'default' : 'secondary'}>
                    {campaign.active ? 'Ativa' : 'Encerrada'}
                  </Badge>
                </div>
                <CardDescription>
                  {period(campaign)}
                  {campaign.description ? ` · ${campaign.description}` : ''}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-2">
                {meta > 0 ? (
                  <>
                    <Progress
                      value={percentual}
                      aria-label={`Progresso da campanha ${campaign.title}`}
                      aria-valuenow={percentual}
                      aria-valuetext={`${percentual}% da meta`}
                    />
                    <p className="text-sm text-muted-foreground">{percentual}% da meta</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Campanha sem meta definida.</p>
                )}
                <p className="text-sm font-medium">
                  {formatMoney(campaign.raised)} de {formatMoney(campaign.goalAmount)} (
                  {campaign.donationsCount} {doacoes})
                </p>
              </CardContent>

              <CardFooter className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => onEdit(campaign)}>
                  <Pencil className="h-4 w-4" aria-hidden="true" /> Editar
                </Button>
                {campaign.active ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={() => onEnd(campaign)}
                  >
                    <Square className="h-4 w-4" aria-hidden="true" /> Encerrar
                  </Button>
                ) : null}
              </CardFooter>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
