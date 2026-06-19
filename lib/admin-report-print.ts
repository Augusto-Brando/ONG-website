import type { AdminReport } from '@/lib/admin-reports'

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

function rows(items: string[][]) {
  return items.map((item) => `<tr>${item.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')
}

function table(title: string, headers: string[], body: string[][]) {
  return `
    <h2>${escapeHtml(title)}</h2>
    <table>
      <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
      <tbody>${rows(body)}</tbody>
    </table>
  `
}

export function printAdminReport(report: AdminReport, generatedAt: Date) {
  const win = window.open('', '_blank', 'width=960,height=720')
  if (!win) return false

  const html = `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Relatório Administrativo</title>
        <style>
          body { color: #111827; font-family: Arial, sans-serif; margin: 32px; }
          h1 { color: #f97316; font-size: 26px; margin: 0 0 4px; }
          h2 { border-bottom: 1px solid #e5e7eb; font-size: 17px; margin: 28px 0 10px; padding-bottom: 6px; }
          p { color: #4b5563; margin: 0 0 18px; }
          .summary { display: grid; gap: 10px; grid-template-columns: repeat(3, 1fr); margin: 22px 0; }
          .metric { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
          .metric strong { display: block; font-size: 24px; }
          .metric span { color: #4b5563; font-size: 12px; }
          table { border-collapse: collapse; margin-bottom: 18px; width: 100%; }
          th, td { border: 1px solid #e5e7eb; font-size: 12px; padding: 8px; text-align: left; }
          th { background: #f9fafb; }
          @media print { body { margin: 18mm; } }
        </style>
      </head>
      <body>
        <h1>Relatório Administrativo</h1>
        <p>Gerado em ${escapeHtml(formatDate(generatedAt))}</p>
        <div class="summary">
          <div class="metric"><strong>${report.totalAnimals}</strong><span>Animais cadastrados</span></div>
          <div class="metric"><strong>${report.availableAnimals}</strong><span>Disponíveis</span></div>
          <div class="metric"><strong>${report.adoptedAnimals}</strong><span>Adoções/Saídas</span></div>
        </div>
        ${table(
          'Animais por categoria',
          ['Categoria', 'Total', 'Disponíveis', 'Adoções/Saídas'],
          report.categoryRows.map((row) => [row.category, String(row.total), String(row.available), String(row.adopted)]),
        )}
        ${table(
          'Histórico de adoções',
          ['Animal', 'Categoria', 'Idade', 'Data registrada'],
          report.adoptionRows.map((row) => [row.name, row.category, row.age, formatDate(row.registeredAt)]),
        )}
        ${table(
          'Entradas e saídas',
          ['Tipo', 'Animal', 'Categoria', 'Data', 'Status'],
          report.movementRows.map((row) => [row.type, row.animal, row.category, formatDate(row.date), row.status]),
        )}
      </body>
    </html>
  `

  win.document.open()
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
  return true
}
