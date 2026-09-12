import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className = '', id, children, ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
          error ? 'border-[var(--color-danger)]' : 'border-slate-300'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
    </div>
  )
})
