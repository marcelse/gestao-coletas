import { Outlet } from 'react-router-dom'
import { InactivityTimer } from '../auth/InactivityTimer'
import { BackToHomeButton } from './BackToHomeButton'
import { Nav } from './Nav'
import { Topbar } from './Topbar'

export function AppLayout() {
  return (
    <div className="min-h-full flex flex-col">
      <InactivityTimer />
      <Topbar />
      <Nav />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        <BackToHomeButton />
        <Outlet />
      </main>
    </div>
  )
}
