import type { Perfil } from './constants'

export function homeRouteFor(perfil: Perfil): string {
  switch (perfil) {
    case 'ADMINISTRADOR':
    case 'COORDENACAO':
      return '/dashboard'
    case 'MOTOBOY':
      return '/minhas-entregas'
    case 'CLIENTE':
      return '/minhas-coletas'
  }
}
