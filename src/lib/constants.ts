export const PERFIS = ['ADMINISTRADOR', 'COORDENACAO', 'MOTOBOY', 'CLIENTE'] as const
export type Perfil = (typeof PERFIS)[number]

export const STAFF_PERFIS: Perfil[] = ['ADMINISTRADOR', 'COORDENACAO']

export const STATUS_COLETA = ['SOLICITADO', 'PENDENTE', 'COLETADO', 'CANCELADO'] as const
export type StatusColeta = (typeof STATUS_COLETA)[number]

export const STATUS_LABEL: Record<StatusColeta, string> = {
  SOLICITADO: 'Solicitado',
  PENDENTE: 'Pendente',
  COLETADO: 'Coletado',
  CANCELADO: 'Cancelado',
}

export const PERFIL_LABEL: Record<Perfil, string> = {
  ADMINISTRADOR: 'Administrador',
  COORDENACAO: 'Coordenação',
  MOTOBOY: 'Motoboy',
  CLIENTE: 'Cliente',
}

export const INACTIVITY_LIMIT_MS = 60 * 60 * 1000 // 1 hora
export const INACTIVITY_CHECK_INTERVAL_MS = 30 * 1000
export const INACTIVITY_STORAGE_KEY = 'gestao-coletas:last-activity'
