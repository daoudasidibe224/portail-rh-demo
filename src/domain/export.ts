// CSV pour Excel en français : séparateur « ; » et BOM UTF-8.
// Une cellule qui commence par = + - @ est préfixée d'une apostrophe (injection de formule).
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[";\n\r]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe
}

function toCsv(rows: readonly (readonly string[])[]): string {
  return '\uFEFF' + rows.map((row) => row.map(csvCell).join(';')).join('\r\n') + '\r\n'
}

interface PlanningRow {
  name: string
  jobTitle: string
  team: string
  cells: readonly string[]
}

export function planningCsv(days: readonly string[], rows: readonly PlanningRow[]): string {
  return toCsv([
    ['Collaborateur', 'Poste', 'Équipe', ...days],
    ...rows.map((r) => [r.name, r.jobTitle, r.team, ...r.cells]),
  ])
}

export function downloadText(filename: string, content: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
