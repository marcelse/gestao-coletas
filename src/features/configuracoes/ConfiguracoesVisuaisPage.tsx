import { useEffect, useState } from 'react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { useToast } from '../../components/Toast'
import { useTheme } from '../../theme/useTheme'
import { uploadLogo, useUpdateConfiguracoesVisuais } from './api'

export function ConfiguracoesVisuaisPage() {
  const { config, refresh } = useTheme()
  const update = useUpdateConfiguracoesVisuais()
  const { notify } = useToast()

  const [corPrimaria, setCorPrimaria] = useState('#0F766E')
  const [corSecundaria, setCorSecundaria] = useState('#334155')
  const [corFundo, setCorFundo] = useState('#F8FAFC')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [enviandoLogo, setEnviandoLogo] = useState(false)

  useEffect(() => {
    if (config) {
      setCorPrimaria(config.cor_primaria)
      setCorSecundaria(config.cor_secundaria)
      setCorFundo(config.cor_fundo)
    }
  }, [config])

  async function handleSalvarCores() {
    try {
      await update.mutateAsync({ cor_primaria: corPrimaria, cor_secundaria: corSecundaria, cor_fundo: corFundo })
      await refresh()
      notify('Cores atualizadas com sucesso.')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao salvar cores.', 'error')
    }
  }

  async function handleEnviarLogo() {
    if (!logoFile) return
    setEnviandoLogo(true)
    try {
      const url = await uploadLogo(logoFile)
      await update.mutateAsync({ cor_primaria: corPrimaria, cor_secundaria: corSecundaria, cor_fundo: corFundo, logo_url: url })
      await refresh()
      notify('Logomarca atualizada com sucesso.')
      setLogoFile(null)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao enviar logomarca.', 'error')
    } finally {
      setEnviandoLogo(false)
    }
  }

  return (
    <div className="max-w-md flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-800 mb-4">Configurações Visuais</h1>

        <div className="flex flex-col gap-3 mb-4">
          <span className="text-sm font-medium text-slate-700">Logomarca atual</span>
          {config?.logo_url ? (
            <img src={config.logo_url} alt="Logomarca" className="h-16 object-contain border border-slate-200 rounded p-2 bg-white" />
          ) : (
            <span className="text-sm text-slate-400">Nenhuma logomarca cadastrada.</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <Button onClick={handleEnviarLogo} disabled={!logoFile || enviandoLogo} className="self-start">
            {enviandoLogo ? 'Enviando…' : 'Enviar Logomarca'}
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Cores da Interface</h2>
        <div className="flex flex-col gap-4">
          <ColorField label="Cor primária" value={corPrimaria} onChange={setCorPrimaria} />
          <ColorField label="Cor secundária" value={corSecundaria} onChange={setCorSecundaria} />
          <ColorField label="Cor de fundo" value={corFundo} onChange={setCorFundo} />
          <Button onClick={handleSalvarCores} disabled={update.isPending} className="self-start">
            {update.isPending ? 'Salvando…' : 'Salvar Cores'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 rounded border border-slate-300" />
      <Input label={label} value={value} onChange={(e) => onChange(e.target.value)} className="flex-1" />
    </div>
  )
}
