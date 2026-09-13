// Tipos manuais equivalentes ao schema em supabase/migrations.
// Assim que o projeto Supabase estiver criado, substitua este arquivo pelo gerado via:
//   npx supabase gen types typescript --project-id <id> > src/types/database.types.ts

export type PerfilUsuario = 'ADMINISTRADOR' | 'COORDENACAO' | 'MOTOBOY' | 'CLIENTE'
export type StatusColeta = 'SOLICITADO' | 'PENDENTE' | 'COLETADO' | 'NAO_COLETADO' | 'CANCELADO'

type ProfilesRow = {
  id: string
  perfil: PerfilUsuario
  nome_completo: string
  telefone: string | null
  ativo: boolean
  senha_temporaria: boolean
  criado_em: string
  atualizado_em: string
}

type FuncionariosRow = {
  id: string
  email: string
  perfil: Exclude<PerfilUsuario, 'CLIENTE'>
  criado_por: string | null
  criado_em: string
}

type ClientesRow = {
  id: string
  nome_clinica: string
  endereco: string
  telefone: string | null
  email: string
  criado_por: string | null
  criado_em: string
}

type TiposAmostraRow = {
  id: string
  nome: string
  ativo: boolean
}

type ColetasRow = {
  id: string
  cliente_id: string
  tipo_amostra_id: string
  endereco_coleta: string
  observacoes: string | null
  status: StatusColeta
  origem: string
  motoboy_id: string | null
  criado_por: string
  atribuido_por: string | null
  atribuido_em: string | null
  coletado_em: string | null
  motivo_nao_coletado: string | null
  criado_em: string
  atualizado_em: string
}

type ConfiguracoesVisuaisRow = {
  id: number
  logo_url: string | null
  cor_primaria: string
  cor_secundaria: string
  cor_fundo: string
  atualizado_por: string | null
  atualizado_em: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfilesRow
        Insert: Partial<ProfilesRow> & Pick<ProfilesRow, 'id' | 'perfil' | 'nome_completo'>
        Update: Partial<ProfilesRow>
        Relationships: []
      }
      funcionarios: {
        Row: FuncionariosRow
        Insert: Partial<FuncionariosRow> & Pick<FuncionariosRow, 'id' | 'email' | 'perfil'>
        Update: Partial<FuncionariosRow>
        Relationships: [
          {
            foreignKeyName: 'funcionarios_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      clientes: {
        Row: ClientesRow
        Insert: Partial<ClientesRow> & Pick<ClientesRow, 'id' | 'nome_clinica' | 'endereco' | 'email'>
        Update: Partial<ClientesRow>
        Relationships: [
          {
            foreignKeyName: 'clientes_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      tipos_amostra: {
        Row: TiposAmostraRow
        Insert: Partial<TiposAmostraRow> & Pick<TiposAmostraRow, 'nome'>
        Update: Partial<TiposAmostraRow>
        Relationships: []
      }
      coletas: {
        Row: ColetasRow
        Insert: Partial<ColetasRow> &
          Pick<ColetasRow, 'cliente_id' | 'tipo_amostra_id' | 'endereco_coleta' | 'criado_por'>
        Update: Partial<ColetasRow>
        Relationships: [
          {
            foreignKeyName: 'coletas_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'coletas_tipo_amostra_id_fkey'
            columns: ['tipo_amostra_id']
            isOneToOne: false
            referencedRelation: 'tipos_amostra'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'coletas_motoboy_id_fkey'
            columns: ['motoboy_id']
            isOneToOne: false
            referencedRelation: 'funcionarios'
            referencedColumns: ['id']
          },
        ]
      }
      configuracoes_visuais: {
        Row: ConfiguracoesVisuaisRow
        Insert: Partial<ConfiguracoesVisuaisRow>
        Update: Partial<ConfiguracoesVisuaisRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      dashboard_indicadores: {
        Args: { data_inicio: string; data_fim: string }
        Returns: {
          a_coletar: number
          coletadas_periodo: number
          coletadas_hoje: number
          coletadas_mes: number
          por_tipo: { nome: string; total: number }[]
          por_motoboy_mes: { nome_completo: string; mes: string; total: number }[]
        }
      }
    }
  }
}
