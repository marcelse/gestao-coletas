import { createContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { ConfiguracoesVisuais } from '../types/domain'

interface ThemeContextValue {
  config: ConfiguracoesVisuais | null
  loading: boolean
  refresh: () => Promise<void>
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function applyCssVars(config: ConfiguracoesVisuais | null) {
  const root = document.documentElement
  if (!config) return
  root.style.setProperty('--color-primary', config.cor_primaria)
  root.style.setProperty('--color-secondary', config.cor_secundaria)
  root.style.setProperty('--color-bg', config.cor_fundo)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfiguracoesVisuais | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase.from('configuracoes_visuais').select('*').eq('id', 1).single()
    setConfig(data ?? null)
    applyCssVars(data ?? null)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <ThemeContext.Provider value={{ config, loading, refresh: load }}>{children}</ThemeContext.Provider>
  )
}
