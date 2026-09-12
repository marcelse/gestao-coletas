import type { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Funcionario = Database['public']['Tables']['funcionarios']['Row']
export type Cliente = Database['public']['Tables']['clientes']['Row']
export type TipoAmostra = Database['public']['Tables']['tipos_amostra']['Row']
export type Coleta = Database['public']['Tables']['coletas']['Row']
export type ConfiguracoesVisuais = Database['public']['Tables']['configuracoes_visuais']['Row']

export type FuncionarioComPerfil = Funcionario & Pick<Profile, 'nome_completo' | 'telefone' | 'ativo'>
export type ClienteComPerfil = Cliente & Pick<Profile, 'nome_completo' | 'telefone' | 'ativo'>

export type ColetaDetalhada = Coleta & {
  cliente: Pick<ClienteComPerfil, 'id' | 'nome_clinica' | 'nome_completo'> | null
  tipo_amostra: Pick<TipoAmostra, 'id' | 'nome'> | null
  motoboy: Pick<FuncionarioComPerfil, 'id' | 'nome_completo'> | null
}
