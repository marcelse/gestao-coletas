import type { ReactNode } from 'react'

export interface Column<T> {
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'Nenhum registro encontrado.',
}: {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  emptyMessage?: string
}) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left">
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-2 font-medium text-slate-600">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                {columns.map((col) => (
                  <td key={col.header} className={`px-4 py-2 ${col.className ?? ''}`}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
