import { useEffect, useState } from 'react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { useToast } from '../../components/Toast'
import { useTiposAmostra } from '../tiposAmostra/api'
import { useClientesAtivos, useCreateColetaStaff } from './api'

export function NovaColetaStaffModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: clientes } = useClientesAtivos()
  const { data: tipos } = useTiposAmostra(true)
  const create = useCreateColetaStaff()
  const { notify } = useToast()

  const [clienteId, setClienteId] = useState('')
  const [tipoAmostraId, setTipoAmostraId] = useState('')
  const [endereco, setEndereco] = useState('')
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    const cliente = clientes?.find((c) => c.id === clienteId)
    if (cliente) setEndereco(cliente.endereco)
  }, [clienteId, clientes])

  async function handleConfirm() {
    if (!clienteId || !tipoAmostraId || !endereco) return
    try {
      await create.mutateAsync({ cliente_id: clienteId, tipo_amostra_id: tipoAmostraId, endereco_coleta: endereco, observacoes })
      notify('Coleta lançada com sucesso.')
      setClienteId('')
      setTipoAmostraId('')
      setEndereco('')
      setObservacoes('')
      onClose()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao lançar coleta.', 'error')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova Coleta">
      <div className="flex flex-col gap-4">
        <Select label="Cliente" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Selecione…</option>
          {clientes?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome_clinica}
            </option>
          ))}
        </Select>
        <Select label="Tipo de amostra" value={tipoAmostraId} onChange={(e) => setTipoAmostraId(e.target.value)}>
          <option value="">Selecione…</option>
          {tipos?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </Select>
        <Input label="Endereço da coleta" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
        <Input label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!clienteId || !tipoAmostraId || !endereco || create.isPending}>
            Lançar Coleta
          </Button>
        </div>
      </div>
    </Modal>
  )
}
