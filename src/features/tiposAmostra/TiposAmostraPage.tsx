import { useState } from 'react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Table } from '../../components/Table'
import { useToast } from '../../components/Toast'
import { useCreateTipoAmostra, useTiposAmostra, useToggleTipoAmostraAtivo } from './api'

export function TiposAmostraPage() {
  const { data: tipos, isLoading } = useTiposAmostra()
  const create = useCreateTipoAmostra()
  const toggle = useToggleTipoAmostraAtivo()
  const { notify } = useToast()
  const [nome, setNome] = useState('')

  async function handleAdd() {
    if (!nome.trim()) return
    try {
      await create.mutateAsync(nome.trim())
      setNome('')
      notify('Tipo de amostra adicionado.')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao adicionar tipo de amostra.', 'error')
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800 mb-4">Tipos de Amostra</h1>

      <div className="flex gap-2 mb-4 max-w-md">
        <Input placeholder="Nome do tipo de amostra" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Button onClick={handleAdd}>Adicionar</Button>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Carregando…</p>
      ) : (
        <Table
          rows={tipos ?? []}
          rowKey={(t) => t.id}
          columns={[
            { header: 'Nome', cell: (t) => t.nome },
            {
              header: 'Status',
              cell: (t) => (
                <span className={t.ativo ? 'text-emerald-700' : 'text-slate-400'}>
                  {t.ativo ? 'Ativo' : 'Inativo'}
                </span>
              ),
            },
            {
              header: 'Ações',
              cell: (t) => (
                <button
                  className={t.ativo ? 'text-[var(--color-danger)] hover:underline' : 'text-emerald-700 hover:underline'}
                  onClick={() =>
                    toggle
                      .mutateAsync({ id: t.id, ativo: !t.ativo })
                      .catch((err) => notify(err.message, 'error'))
                  }
                >
                  {t.ativo ? 'Inativar' : 'Ativar'}
                </button>
              ),
            },
          ]}
        />
      )}
    </div>
  )
}
