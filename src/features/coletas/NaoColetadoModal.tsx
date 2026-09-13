import { useState } from 'react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Modal } from '../../components/Modal'
import { useToast } from '../../components/Toast'
import type { ColetaDetalhada } from '../../types/domain'
import { useMarcarNaoColetado } from './api'

export function NaoColetadoModal({ coleta, onClose }: { coleta: ColetaDetalhada | null; onClose: () => void }) {
  const marcarNaoColetado = useMarcarNaoColetado()
  const { notify } = useToast()
  const [motivo, setMotivo] = useState('')

  function handleClose() {
    setMotivo('')
    onClose()
  }

  async function handleConfirm() {
    if (!coleta || !motivo.trim()) return
    try {
      await marcarNaoColetado.mutateAsync({ id: coleta.id, motivo: motivo.trim() })
      notify('Coleta marcada como não coletada.')
      handleClose()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao registrar não coleta.', 'error')
    }
  }

  return (
    <Modal open={!!coleta} onClose={handleClose} title="Marcar como Não Coletado">
      {coleta && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Coleta de <strong>{coleta.tipo_amostra?.nome}</strong> em {coleta.endereco_coleta}.
          </p>
          <Input
            label="Motivo da não coleta"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            error={motivo.length === 0 ? undefined : motivo.trim().length === 0 ? 'Informe o motivo.' : undefined}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              disabled={!motivo.trim() || marcarNaoColetado.isPending}
            >
              {marcarNaoColetado.isPending ? 'Salvando…' : 'Confirmar'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
