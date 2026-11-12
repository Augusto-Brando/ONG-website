'use client'

// Tela Doações: tabela de doações (filtros por período e tipo) e cartões de campanhas.
import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { CampaignCards } from '@/components/admin/doacoes/campaign-cards'
import { CampaignDialog } from '@/components/admin/doacoes/campaign-dialog'
import { DonationDialog } from '@/components/admin/doacoes/donation-dialog'
import { DonationTable } from '@/components/admin/doacoes/donation-table'
import { DONATION_TYPES, type CampaignRow, type DonationRow } from '@/components/admin/doacoes/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Filters = { from: string; to: string; type: string }

const emptyFilters: Filters = { from: '', to: '', type: 'todos' }

export default function DoacoesPage() {
  const [tab, setTab] = useState('doacoes')
  const [filters, setFilters] = useState<Filters>(emptyFilters)

  const [donations, setDonations] = useState<DonationRow[]>([])
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
    if (current.type && current.type !== 'todos') params.set('type', current.type)
    try {
      const res = await fetch(`/api/donations?${params.toString()}`)
      if (!res.ok) {
        toast.error('Erro ao carregar as doações.')
        return
      }
      const data = await res.json()
      setDonations(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Erro de conexão ao carregar as doações.')
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

  return (
    <AdminShell
      title="Doações"
      description={`${donations.length} doação(ões) no filtro atual · ${campaigns.length} campanha(s)`}
      actions={
        tab === 'campanhas' ? (
          <Button onClick={openCreateCampaign} size="sm" className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" /> Nova campanha
          </Button>
        ) : (
          <Button onClick={openCreateDonation} size="sm" className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" /> Nova doação
          </Button>
        )
      }
    >
      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList>
          <TabsTrigger value="doacoes">Doações</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
        </TabsList>

        <TabsContent value="doacoes" className="space-y-4">
          <section
            aria-label="Filtros de doações"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
          >
            <div className="space-y-2">
              <Label htmlFor="from">De</Label>
              <Input
                id="from"
                type="date"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">Até</Label>
              <Input
                id="to"
                type="date"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-filter">Tipo</Label>
              <Select
                value={filters.type}
                onValueChange={(v) => setFilters({ ...filters, type: v })}
              >
                <SelectTrigger id="type-filter" className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {DONATION_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setFilters(emptyFilters)}
              >
                Limpar filtros
              </Button>
            </div>
          </section>

          <DonationTable
            rows={donations}
            loading={loadingDonations}
            onEdit={openEditDonation}
            onDelete={handleDeleteDonation}
          />
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
