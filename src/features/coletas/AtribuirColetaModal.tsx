import { useState } from 'react'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { useToast } from '../../components/Toast'
import type { ColetaDetalhada } from '../../types/domain'
import { useAtribuirMotoboy, useMotoboysAtivos } from './api'

export function AtribuirColetaModal({ coleta, onClose }: { coleta: ColetaDetalhada | null; onClose: () => void }) {
  const { data: motoboys } = useMotoboysAtivos()
  const atribuir = useAtribuirMotoboy()
  const { notify } = useToast()
  const [motoboyId, setMotoboyId] = useState('')

  async function handleConfirm() {
    if (!coleta || !motoboyId) return
    try {
      await atribuir.mutateAsync({ id: coleta.id, motoboy_id: motoboyId })
      notify('Motoboy atribuído com sucesso.')
      setMotoboyId('')
      onClose()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao atribuir motoboy.', 'error')
    }
  }

  return (
    <Modal open={!!coleta} onClose={onClose} title="Atribuir Motoboy">
      {coleta && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Coleta de <strong>{coleta.tipo_amostra?.nome}</strong> em {coleta.endereco_coleta}
          </p>
          <Select label="Motoboy" value={motoboyId} onChange={(e) => setMotoboyId(e.target.value)}>
            <option value="">Selecione…</option>
            {motoboys?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome_completo}
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!motoboyId || atribuir.isPending}>
              Atribuir
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
