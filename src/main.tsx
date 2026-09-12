import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const root = createRoot(document.getElementById('root')!)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  root.render(
    <div style={{ maxWidth: 560, margin: '80px auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 20 }}>Configuração pendente</h1>
      <p>
        Faltam as variáveis de ambiente <code>VITE_SUPABASE_URL</code> e/ou{' '}
        <code>VITE_SUPABASE_ANON_KEY</code>.
      </p>
      <p>
        Copie <code>.env.example</code> para <code>.env.local</code>, preencha com os dados do seu
        projeto Supabase e reinicie o servidor de desenvolvimento.
      </p>
    </div>,
  )
} else {
  import('./App').then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
}
