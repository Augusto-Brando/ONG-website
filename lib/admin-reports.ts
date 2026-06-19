export type ReportDog = {
  id: number
  name: string
  breed: string
  age: string
  available: boolean
  createdAt: Date | string
}

export type CategoryReportRow = {
  category: string
  total: number
  available: number
  adopted: number
}

export type AdoptionReportRow = {
  id: number
  name: string
  category: string
  age: string
  registeredAt: Date
}

export type MovementReportRow = {
  id: string
  animal: string
  category: string
  type: 'Entrada' | 'Saída'
  date: Date
  status: string
}

export type AdminReport = {
  totalAnimals: number
  availableAnimals: number
  adoptedAnimals: number
  categoryRows: CategoryReportRow[]
  adoptionRows: AdoptionReportRow[]
  movementRows: MovementReportRow[]
}

function getCategory(dog: ReportDog) {
  return dog.breed.trim() || 'Sem categoria'
}

function byDateDesc<T extends { date?: Date; registeredAt?: Date }>(a: T, b: T) {
  const left = a.date ?? a.registeredAt
  const right = b.date ?? b.registeredAt
  return right!.getTime() - left!.getTime()
}

export function buildAdminReport(dogs: ReportDog[]): AdminReport {
  const categories = new Map<string, CategoryReportRow>()
  const adoptionRows: AdoptionReportRow[] = []
  const movementRows: MovementReportRow[] = []

  for (const dog of dogs) {
    const category = getCategory(dog)
    const current = categories.get(category) ?? { category, total: 0, available: 0, adopted: 0 }

    current.total += 1
    if (dog.available) current.available += 1
    if (!dog.available) current.adopted += 1
    categories.set(category, current)

    movementRows.push({
      id: `${dog.id}-entry`,
      animal: dog.name,
      category,
      type: 'Entrada',
      date: new Date(dog.createdAt),
      status: 'Cadastro do animal',
    })

    if (!dog.available) {
      const registeredAt = new Date(dog.createdAt)
      adoptionRows.push({ id: dog.id, name: dog.name, category, age: dog.age, registeredAt })
      movementRows.push({
        id: `${dog.id}-exit`,
        animal: dog.name,
        category,
        type: 'Saída',
        date: registeredAt,
        status: 'Marcado como indisponível',
      })
    }
  }

  const categoryRows = [...categories.values()].sort((a, b) => a.category.localeCompare(b.category, 'pt-BR'))

  return {
    totalAnimals: dogs.length,
    availableAnimals: dogs.filter((dog) => dog.available).length,
    adoptedAnimals: adoptionRows.length,
    categoryRows,
    adoptionRows: adoptionRows.sort(byDateDesc),
    movementRows: movementRows.sort(byDateDesc),
  }
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`
}

function csvRow(values: Array<string | number>) {
  return values.map(csvCell).join(',')
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function buildAdminReportCsv(report: AdminReport) {
  const lines = [
    'Resumo',
    csvRow(['Indicador', 'Quantidade']),
    csvRow(['Animais cadastrados', report.totalAnimals]),
    csvRow(['Disponíveis', report.availableAnimals]),
    csvRow(['Adoções/Saídas', report.adoptedAnimals]),
    '',
    'Animais por categoria',
    csvRow(['Categoria', 'Total', 'Disponíveis', 'Adoções/Saídas']),
    ...report.categoryRows.map((row) => csvRow([row.category, row.total, row.available, row.adopted])),
    '',
    'Histórico de adoções',
    csvRow(['Animal', 'Categoria', 'Idade', 'Data registrada']),
    ...report.adoptionRows.map((row) => csvRow([row.name, row.category, row.age, formatDate(row.registeredAt)])),
    '',
    'Entradas e saídas',
    csvRow(['Tipo', 'Animal', 'Categoria', 'Data', 'Status']),
    ...report.movementRows.map((row) => csvRow([row.type, row.animal, row.category, formatDate(row.date), row.status])),
  ]

  return `\uFEFF${lines.join('\n')}`
}
