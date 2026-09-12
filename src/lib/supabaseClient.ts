import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltam as variáveis de ambiente VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY. Copie .env.example para .env.local e preencha os valores do seu projeto Supabase.',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
