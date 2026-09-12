import { useEffect } from 'react'
import {
  INACTIVITY_CHECK_INTERVAL_MS,
  INACTIVITY_LIMIT_MS,
  INACTIVITY_STORAGE_KEY,
} from '../lib/constants'
import { useAuth } from './useAuth'

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const

function readLastActivity(): number {
  const raw = localStorage.getItem(INACTIVITY_STORAGE_KEY)
  return raw ? Number(raw) : Date.now()
}

function writeLastActivity() {
  localStorage.setItem(INACTIVITY_STORAGE_KEY, String(Date.now()))
}

/**
 * Encerra a sessão após 1h sem atividade do usuário. O refresh automático do
 * token do Supabase mantém a sessão viva indefinidamente enquanto a aba está
 * aberta, então esta é a única camada que de fato mede inatividade — e não
 * apenas tempo desde o último login/refresh. Sincroniza entre abas via
 * localStorage.
 */
export function InactivityTimer() {
  const { session, signOut } = useAuth()

  useEffect(() => {
    if (!session) return

    writeLastActivity()

    let debounceHandle: number | undefined
    const onActivity = () => {
      if (debounceHandle) return
      debounceHandle = window.setTimeout(() => {
        writeLastActivity()
        debounceHandle = undefined
      }, 1000)
    }

    for (const evt of ACTIVITY_EVENTS) window.addEventListener(evt, onActivity, { passive: true })

    const interval = window.setInterval(() => {
      if (Date.now() - readLastActivity() >= INACTIVITY_LIMIT_MS) {
        signOut()
      }
    }, INACTIVITY_CHECK_INTERVAL_MS)

    return () => {
      for (const evt of ACTIVITY_EVENTS) window.removeEventListener(evt, onActivity)
      window.clearInterval(interval)
      if (debounceHandle) window.clearTimeout(debounceHandle)
    }
  }, [session, signOut])

  return null
}
