import { useState } from 'react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Modal } from '../../components/Modal'
import { useToast } from '../../components/Toast'
import { extractFunctionErrorMessage } from '../../lib/functionsError'
import type { Usuario } from './api'
import { useResetSenhaUsuario } from './api'

export function ResetSenhaModal({ usuario, onClose }: { usuario: Usuario | null; onClose: () => void }) {
  const resetSenha = useResetSenhaUsuario()
  const { notify } = useToast()
  const [novaSenha, setNovaSenha] = useState('')

  function handleClose() {
    setNovaSenha('')
    onClose()
  }

  async function handleConfirm() {
    if (!usuario || novaSenha.length < 6) return
    try {
      await resetSenha.mutateAsync({ user_id: usuario.id, nova_senha: novaSenha })
      notify(`Senha de ${usuario.nome} alterada com sucesso.`)
      handleClose()
    } catch (err) {
      notify(await extractFunctionErrorMessage(err, 'Erro ao alterar senha.'), 'error')
    }
  }

  return (
    <Modal open={!!usuario} onClose={handleClose} title="Alterar Senha">
      {usuario && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Definir uma nova senha para <strong>{usuario.nome}</strong>.
          </p>
          <Input
            label="Nova senha"
            type="text"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            error={novaSenha.length > 0 && novaSenha.length < 6 ? 'A senha deve ter ao menos 6 caracteres.' : undefined}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={novaSenha.length < 6 || resetSenha.isPending}>
              {resetSenha.isPending ? 'Salvando…' : 'Salvar Nova Senha'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
