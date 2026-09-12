import { Route, Routes } from 'react-router-dom'
import { ChangePasswordForm } from '../features/auth/ChangePasswordForm'
import { LoginPage } from '../auth/LoginPage'
import { RequireAuth } from '../auth/RequireAuth'
import { ClienteFormPage } from '../features/clientes/ClienteFormPage'
import { ClientesListPage } from '../features/clientes/ClientesListPage'
import { ColetasListPage } from '../features/coletas/ColetasListPage'
import { ColetasMotoboyHistoricoPage } from '../features/coletas/ColetasMotoboyHistoricoPage'
import { ColetasMotoboyPage } from '../features/coletas/ColetasMotoboyPage'
import { MinhasColetasPage } from '../features/coletas/MinhasColetasPage'
import { NovaColetaFormPage } from '../features/coletas/NovaColetaFormPage'
import { ConfiguracoesVisuaisPage } from '../features/configuracoes/ConfiguracoesVisuaisPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { FuncionarioFormPage } from '../features/funcionarios/FuncionarioFormPage'
import { FuncionariosListPage } from '../features/funcionarios/FuncionariosListPage'
import { EditProfileForm } from '../features/perfil/EditProfileForm'
import { TiposAmostraPage } from '../features/tiposAmostra/TiposAmostraPage'
import { AppLayout } from '../layout/AppLayout'
import { RoleHomeRedirect } from './RoleHomeRedirect'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RoleHomeRedirect />} />
          <Route path="/meus-dados" element={<EditProfileForm />} />
          <Route path="/alterar-senha" element={<ChangePasswordForm />} />

          <Route element={<RequireAuth roles={['ADMINISTRADOR', 'COORDENACAO']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/funcionarios" element={<FuncionariosListPage />} />
            <Route path="/funcionarios/novo" element={<FuncionarioFormPage />} />
            <Route path="/funcionarios/:id/editar" element={<FuncionarioFormPage />} />
            <Route path="/clientes" element={<ClientesListPage />} />
            <Route path="/clientes/novo" element={<ClienteFormPage />} />
            <Route path="/clientes/:id/editar" element={<ClienteFormPage />} />
            <Route path="/coletas" element={<ColetasListPage />} />
            <Route path="/tipos-amostra" element={<TiposAmostraPage />} />
          </Route>

          <Route element={<RequireAuth roles={['ADMINISTRADOR']} />}>
            <Route path="/configuracoes-visuais" element={<ConfiguracoesVisuaisPage />} />
          </Route>

          <Route element={<RequireAuth roles={['MOTOBOY']} />}>
            <Route path="/minhas-entregas" element={<ColetasMotoboyPage />} />
            <Route path="/minhas-entregas/historico" element={<ColetasMotoboyHistoricoPage />} />
          </Route>

          <Route element={<RequireAuth roles={['CLIENTE']} />}>
            <Route path="/minhas-coletas" element={<MinhasColetasPage />} />
            <Route path="/minhas-coletas/nova" element={<NovaColetaFormPage />} />
          </Route>

          <Route path="*" element={<RoleHomeRedirect />} />
        </Route>
      </Route>
    </Routes>
  )
}
