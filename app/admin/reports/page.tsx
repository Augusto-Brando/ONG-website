'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart3, FileSpreadsheet, FileText, PawPrint } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
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
  const report = useMemo(() => buildAdminReport(dogs), [dogs])
  const generatedAt = useMemo(() => new Date(), [dogs])

  async function fetchDogs() {
    const res = await fetch('/api/dogs')
    if (!res.ok) {
      toast.error('Erro ao carregar dados do relatório.')
      setLoading(false)
      return
    }
    setDogs(await res.json())
    setLoading(false)
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 sticky top-0 z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-primary leading-none">Relatórios</p>
              <p className="text-xs text-muted-foreground">Amor não tem Raça</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Animais</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={exportPdf} disabled={loading}>
              <FileText className="w-4 h-4" /> <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button size="sm" className="gap-2" onClick={exportSpreadsheet} disabled={loading}>
              <FileSpreadsheet className="w-4 h-4" /> <span className="hidden sm:inline">Planilha</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatórios Administrativos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Dados consolidados a partir dos animais cadastrados no sistema.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SummaryCard label="Animais cadastrados" value={report.totalAnimals} />
            <SummaryCard label="Disponíveis para adoção" value={report.availableAnimals} />
            <SummaryCard label="Adoções/Saídas registradas" value={report.adoptedAnimals} />
          </div>
        </section>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Carregando relatórios...</div>
        ) : dogs.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <PawPrint className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">Nenhum animal cadastrado para gerar relatórios.</p>
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="font-semibold text-foreground">Quantidade de animais por categoria</h2>
              <div className="rounded-lg border border-border bg-card">
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
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-semibold text-foreground">Histórico de adoções</h2>
              <div className="rounded-lg border border-border bg-card">
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
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-semibold text-foreground">Registros de entradas e saídas</h2>
              <div className="rounded-lg border border-border bg-card">
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
                          <Badge variant={row.type === 'Entrada' ? 'default' : 'secondary'}>{row.type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{row.animal}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>{formatDate(row.date)}</TableCell>
                        <TableCell>{row.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
