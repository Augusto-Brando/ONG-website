'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { HandCoins, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { CampaignCards } from '@/components/admin/doacoes/campaign-cards'
import { CampaignDialog } from '@/components/admin/doacoes/campaign-dialog'
import { DonationDialog } from '@/components/admin/doacoes/donation-dialog'
import { DonationTable, donorName } from '@/components/admin/doacoes/donation-table'
import { PendingPix } from '@/components/admin/doacoes/pending-pix'
import { DONATION_TYPES, type CampaignRow, type DonationRow } from '@/components/admin/doacoes/types'
import { CarregandoLista, ErroLista, SemResultados, VazioLista } from '@/components/admin/lista/estados'
import { BarraFiltros, CampoBusca, FiltroData, FiltroSelect } from '@/components/admin/lista/filtros'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { correspondeBusca, descricaoContagem, TODOS } from '@/lib/busca'

type Filters = { from: string; to: string; type: string }

const emptyFilters: Filters = { from: '', to: '', type: TODOS }

export default function DoacoesPage() {
  const [tab, setTab] = useState('doacoes')
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [busca, setBusca] = useState('')
  const [erroDoacoes, setErroDoacoes] = useState<string | null>(null)

  const [donations, setDonations] = useState<DonationRow[]>([])
  const [pending, setPending] = useState<DonationRow[]>([])
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([])
  const [loadingDonations, setLoadingDonations] = useState(true)
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)

  const [donationDialogOpen, setDonationDialogOpen] = useState(false)
  const [editingDonation, setEditingDonation] = useState<DonationRow | null>(null)
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<CampaignRow | null>(null)

  const loadDonations = useCallback(async (current: Filters) => {
    setLoadingDonations(true)
    const params = new URLSearchParams()
    if (current.from) params.set('from', current.from)
    if (current.to) params.set('to', current.to)
    if (current.type && current.type !== TODOS) params.set('type', current.type)
    try {
      const res = await fetch(`/api/donations?${params.toString()}`)
      if (!res.ok) {
        setErroDoacoes('Não foi possível carregar as doações.')
        return
      }
      setErroDoacoes(null)
      const data = await res.json()
      setDonations(Array.isArray(data) ? data : [])
      const allRes = params.size ? await fetch('/api/donations') : null
      if (allRes && !allRes.ok) throw new Error('Falha ao carregar a fila Pix')
      const all: DonationRow[] = allRes ? await allRes.json() : data
      setPending(all.filter(row => row.status === 'pendente'))
    } catch {
      setErroDoacoes('Falha de conexão ao carregar as doações.')
    } finally {
      setLoadingDonations(false)
    }
  }, [])

  const loadCampaigns = useCallback(async () => {
    setLoadingCampaigns(true)
    try {
      const res = await fetch('/api/campaigns')
      if (!res.ok) {
        toast.error('Erro ao carregar as campanhas.')
        return
      }
      const data = await res.json()
      setCampaigns(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Erro de conexão ao carregar as campanhas.')
    } finally {
      setLoadingCampaigns(false)
    }
  }, [])

  useEffect(() => {
    loadDonations(filters)
  }, [filters, loadDonations])

  useEffect(() => {
    loadCampaigns()
  }, [loadCampaigns])

  function openCreateDonation() {
    setEditingDonation(null)
    setDonationDialogOpen(true)
  }

  function openEditDonation(row: DonationRow) {
    setEditingDonation(row)
    setDonationDialogOpen(true)
  }

  function openCreateCampaign() {
    setEditingCampaign(null)
    setCampaignDialogOpen(true)
  }

  function openEditCampaign(campaign: CampaignRow) {
    setEditingCampaign(campaign)
    setCampaignDialogOpen(true)
  }

  async function handleDeleteDonation(row: DonationRow) {
    const nome = row.donorName?.trim() || 'Anônimo'
    if (!confirm(`Excluir a doação de ${nome}? O lançamento financeiro vinculado também será removido.`)) {
      return
    }
    try {
      const res = await fetch(`/api/donations/${row.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Doação excluída.')
        loadDonations(filters)
        loadCampaigns()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Erro ao excluir a doação.')
      }
    } catch {
      toast.error('Erro de conexão ao excluir a doação.')
    }
  }

  async function handleEndCampaign(campaign: CampaignRow) {
    if (!confirm(`Encerrar a campanha "${campaign.title}"?`)) return
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: campaign.title,
          description: campaign.description ?? '',
          goalAmount: campaign.goalAmount,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          active: false,
        }),
      })
      if (res.ok) {
        toast.success('Campanha encerrada.')
        loadCampaigns()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Erro ao encerrar a campanha.')
      }
    } catch {
      toast.error('Erro de conexão ao encerrar a campanha.')
    }
  }

  async function handlePixStatus(row: DonationRow, status: 'confirmada' | 'recusada') {
    if (updatingStatus !== null) return
    if (status === 'recusada' && !confirm(`Recusar o Pix ${row.pixTxid || row.id}? Confira antes se ele aparece no extrato.`)) return
    setUpdatingStatus(row.id)
    try {
      const res = await fetch(`/api/donations/${row.id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      })
      if (res.ok) toast.success(status === 'confirmada' ? 'Pix confirmado. Campanha e financeiro atualizados.' : 'Pix recusado.')
      else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Não foi possível atualizar o Pix.')
      }
      await Promise.all([loadDonations(filters), loadCampaigns()])
    } catch {
      toast.error('Erro de conexão ao atualizar o Pix. Recarregue a lista antes de tentar de novo.')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const periodoInvalido = Boolean(filters.from && filters.to && filters.from > filters.to)
  const filtrosApi = filters.from !== '' || filters.to !== '' || filters.type !== TODOS
  const filtrando = filtrosApi || busca.trim() !== ''

  const doacoesFiltradas = useMemo(
    () => donations.filter((d) => correspondeBusca(busca, donorName(d), d.description, d.campaign?.title, d.pixTxid)),
    [donations, busca],
  )

  function limparFiltros() {
    setFilters(emptyFilters)
    setBusca('')
  }

  return (
    <AdminShell
      title="Doações"
      description={`${descricaoContagem(doacoesFiltradas.length, donations.length, 'doação', 'doações', busca.trim() !== '')}${filtrosApi ? ' no período/tipo escolhido' : ''} · ${campaigns.length} ${campaigns.length === 1 ? 'campanha' : 'campanhas'}`}
      actions={
        tab === 'campanhas' ? (
          <Button onClick={openCreateCampaign} size="sm" className="gap-2">
            <Plus className="size-4" aria-hidden="true" /> Nova campanha
          </Button>
        ) : (
          <Button onClick={openCreateDonation} size="sm" className="gap-2">
            <Plus className="size-4" aria-hidden="true" /> Nova doação
          </Button>
        )
      }
    >
      <PendingPix rows={pending} loading={loadingDonations} busy={updatingStatus} onStatus={handlePixStatus} />
      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList>
          <TabsTrigger value="doacoes">Doações</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
        </TabsList>

        <TabsContent value="doacoes" className="space-y-4">
          <BarraFiltros rotulo="Filtros de doações" ativos={filtrando} onLimpar={limparFiltros}>
            <CampoBusca
              id="busca-doacoes"
              rotulo="Buscar por doador, campanha ou código Pix"
              valor={busca}
              onMudar={setBusca}
              placeholder="Ex.: Maria"
            />
            <FiltroData
              id="from"
              rotulo="De"
              valor={filters.from}
              max={filters.to}
              invalido={periodoInvalido}
              onMudar={(v) => setFilters({ ...filters, from: v })}
            />
            <FiltroData
              id="to"
              rotulo="Até"
              valor={filters.to}
              min={filters.from}
              invalido={periodoInvalido}
              onMudar={(v) => setFilters({ ...filters, to: v })}
            />
            <FiltroSelect
              id="type-filter"
              rotulo="Tipo"
              valor={filters.type}
              onMudar={(v) => setFilters({ ...filters, type: v })}
              opcoes={DONATION_TYPES}
            />
          </BarraFiltros>
          {periodoInvalido && (
            <p role="alert" className="text-sm text-(--ant-erro-texto-forte)">
              A data inicial não pode ser depois da data final.
            </p>
          )}

          {loadingDonations ? (
            <CarregandoLista rotulo="Carregando doações" />
          ) : erroDoacoes ? (
            <ErroLista mensagem={erroDoacoes} onTentar={() => loadDonations(filters)} />
          ) : donations.length === 0 && !filtrosApi ? (
            <VazioLista
              icone={HandCoins}
              titulo="Nenhuma doação registrada"
              descricao="Os Pix feitos pelo site aparecem aqui. Doações de ração, remédios e materiais entram pelo botão “Nova doação”."
            />
          ) : doacoesFiltradas.length === 0 ? (
            <SemResultados onLimpar={limparFiltros} />
          ) : (
            <DonationTable rows={doacoesFiltradas} onEdit={openEditDonation} onDelete={handleDeleteDonation} />
          )}
        </TabsContent>

        <TabsContent value="campanhas">
          <CampaignCards
            campaigns={campaigns}
            loading={loadingCampaigns}
            onEdit={openEditCampaign}
            onEnd={handleEndCampaign}
          />
        </TabsContent>
      </Tabs>

      <DonationDialog
        open={donationDialogOpen}
        onOpenChange={setDonationDialogOpen}
        editing={editingDonation}
        campaigns={campaigns}
        onSaved={() => {
          loadDonations(filters)
          loadCampaigns()
        }}
      />

      <CampaignDialog
        open={campaignDialogOpen}
        onOpenChange={setCampaignDialogOpen}
        editing={editingCampaign}
        onSaved={loadCampaigns}
      />
    </AdminShell>
  )
}
