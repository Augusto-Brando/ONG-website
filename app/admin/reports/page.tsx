'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, FileSpreadsheet, FileText, PawPrint, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/admin-shell'
import { CarregandoLista, ErroLista, MolduraTabela, VazioLista } from '@/components/admin/lista/estados'
import { FiltroData } from '@/components/admin/lista/filtros'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { buildAdminReport, buildAdminReportCsv, type ReportDog } from '@/lib/admin-reports'
import { printAdminReport } from '@/lib/admin-report-print'
import { cn } from '@/lib/utils'

const EXPORT_ENTITIES = [
  { slug: 'animais', label: 'Animais' },
  { slug: 'adocoes', label: 'Adoções' },
  { slug: 'doacoes', label: 'Doações' },
  { slug: 'financeiro', label: 'Financeiro' },
  { slug: 'estoque', label: 'Estoque' },
  { slug: 'tratamentos', label: 'Tratamentos' },
] as const

type ExportEntity = (typeof EXPORT_ENTITIES)[number]['slug']

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

function downloadCsv(content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `relatorio-admin-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-(--ant-areia) bg-(--ant-branco) p-4">
      <p className="text-2xl font-bold text-(--ant-tinta)">{value}</p>
      <p className="text-sm text-(--ant-tinta-suave)">{label}</p>
    </div>
  )
}

function EmptyRows({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-8 text-center text-muted-foreground">
        {label}
      </TableCell>
    </TableRow>
  )
}

export default function AdminReportsPage() {
  const [dogs, setDogs] = useState<ReportDog[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const report = useMemo(() => buildAdminReport(dogs), [dogs])
  const generatedAt = useMemo(() => new Date(), [dogs])

  const periodInvalid = Boolean(from && to && from > to)

  async function fetchDogs() {
    setLoading(true)
    try {
      const res = await fetch('/api/dogs')
      if (!res.ok) {
        setErro('Não foi possível carregar os dados do relatório.')
        return
      }
      setDogs(await res.json())
      setErro(null)
    } catch {
      setErro('Falha de conexão ao carregar os dados do relatório.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDogs()
  }, [])

  function exportSpreadsheet() {
    downloadCsv(buildAdminReportCsv(report))
  }

  function exportPdf() {
    const opened = printAdminReport(report, generatedAt)
    if (!opened) toast.error('Não foi possível abrir a janela de impressão.')
  }

  function exportHref(entity: ExportEntity) {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const query = params.toString()
    return `/api/export/${entity}${query ? `?${query}` : ''}`
  }

  function handleExportClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (periodInvalid) {
      e.preventDefault()
      toast.error('A data inicial não pode ser depois da data final.')
    }
  }

  return (
    <AdminShell
      title="Relatórios"
      description="Dados consolidados dos animais e exportação das demais áreas em CSV."
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-2" onClick={exportPdf} disabled={loading}>
            <FileText className="h-4 w-4" aria-hidden="true" /> PDF
          </Button>
          <Button size="sm" className="gap-2" onClick={exportSpreadsheet} disabled={loading}>
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" /> Planilha
          </Button>
        </>
      }
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="font-semibold text-(--ant-tinta)">Resumo</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryCard label="Animais cadastrados" value={report.totalAnimals} />
            <SummaryCard label="Disponíveis para adoção" value={report.availableAnimals} />
            <SummaryCard label="Adoções/Saídas registradas" value={report.adoptedAnimals} />
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-semibold text-(--ant-tinta)">Exportar dados (CSV)</h2>
            <p className="text-sm text-(--ant-tinta-suave)">
              Escolha o período (opcional) e baixe a planilha da área. O arquivo abre no Excel e no
              LibreOffice.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <FiltroData id="export-from" rotulo="De" valor={from} max={to} invalido={periodInvalid} onMudar={setFrom} />
            <FiltroData id="export-to" rotulo="Até" valor={to} min={from} invalido={periodInvalid} onMudar={setTo} />
          </div>

          {periodInvalid && (
            <p role="alert" className="text-sm text-(--ant-erro-texto-forte)">
              A data inicial não pode ser depois da data final.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {EXPORT_ENTITIES.map((entity) => (
              <a
                key={entity.slug}
                href={exportHref(entity.slug)}
                download
                onClick={handleExportClick}
                aria-disabled={periodInvalid || undefined}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'gap-2',
                  periodInvalid && 'pointer-events-none opacity-50',
                )}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {entity.label}
              </a>
            ))}
          </div>

          <p className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Em respeito à LGPD, as exportações de adoções e de doações não incluem telefone nem
              e-mail dos interessados e doadores.
            </span>
          </p>
        </section>

        {loading ? (
          <CarregandoLista rotulo="Carregando relatórios" linhas={3} />
        ) : erro ? (
          <ErroLista mensagem={erro} onTentar={fetchDogs} />
        ) : dogs.length === 0 ? (
          <VazioLista
            icone={PawPrint}
            titulo="Nenhum animal cadastrado"
            descricao="O resumo e as tabelas aparecem quando houver animais no cadastro. A exportação em CSV acima já funciona."
          />
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="font-semibold text-(--ant-tinta)">Quantidade de animais por categoria</h2>
              <MolduraTabela rotulo="Animais por categoria">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria/Raça</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Disponíveis</TableHead>
                      <TableHead>Adoções/Saídas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.categoryRows.map((row) => (
                      <TableRow key={row.category}>
                        <TableCell className="font-medium">{row.category}</TableCell>
                        <TableCell>{row.total}</TableCell>
                        <TableCell>{row.available}</TableCell>
                        <TableCell>{row.adopted}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </MolduraTabela>
            </section>

            <section className="space-y-3">
              <h2 className="font-semibold text-(--ant-tinta)">Histórico de adoções</h2>
              <MolduraTabela rotulo="Histórico de adoções">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Animal</TableHead>
                      <TableHead>Categoria/Raça</TableHead>
                      <TableHead>Idade</TableHead>
                      <TableHead>Data registrada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.adoptionRows.length === 0 ? (
                      <EmptyRows colSpan={4} label="Nenhuma adoção/saída registrada." />
                    ) : (
                      report.adoptionRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell>{row.age}</TableCell>
                          <TableCell>{formatDate(row.registeredAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </MolduraTabela>
            </section>

            <section className="space-y-3">
              <h2 className="font-semibold text-(--ant-tinta)">Registros de entradas e saídas</h2>
              <MolduraTabela rotulo="Entradas e saídas">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Animal</TableHead>
                      <TableHead>Categoria/Raça</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.movementRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Badge variant={row.type === 'Entrada' ? 'default' : 'secondary'}>
                            {row.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{row.animal}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>{formatDate(row.date)}</TableCell>
                        <TableCell>{row.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </MolduraTabela>
            </section>
          </>
        )}
      </div>
    </AdminShell>
  )
}
