import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface ToastItem {
  id: number
  message: string
  variant: 'success' | 'error'
}

interface ToastContextValue {
  notify: (message: string, variant?: ToastItem['variant']) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const notify = useCallback((message: string, variant: ToastItem['variant'] = 'success') => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, message, variant }])
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`px-4 py-2 rounded-md shadow-lg text-sm text-white ${
              item.variant === 'success' ? 'bg-emerald-600' : 'bg-[var(--color-danger)]'
            }`}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
