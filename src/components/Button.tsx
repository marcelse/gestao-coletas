import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-[var(--color-primary)] text-white hover:opacity-90',
  secondary: 'bg-[var(--color-secondary)] text-white hover:opacity-90',
  danger: 'bg-[var(--color-danger)] text-white hover:opacity-90',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-300',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
}
