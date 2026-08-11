// Utilidad genérica de exportación a CSV, sin dependencias externas.
export function descargarCSV(filename, headers, rows) {
  const escapar = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`
  const contenido = [
    headers.map(escapar).join(','),
    ...rows.map((row) => row.map(escapar).join(',')),
  ].join('\n')

  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
