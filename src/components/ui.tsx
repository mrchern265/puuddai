import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

export function Button({
  variant = 'primary',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'accent' | 'ghost'
}) {
  const base = 'rounded-full px-6 py-3 font-bold transition disabled:opacity-50'
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    accent: 'bg-accent text-white hover:bg-accent-dark',
    ghost: 'bg-brand-light text-brand hover:bg-brand-light/70',
  }[variant]
  return <button className={`${base} ${styles} ${className}`} {...rest} />
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`rounded-2xl bg-white p-5 shadow-sm ${className}`}>{children}</div>
}

export function LoadingScreen({ text = 'กำลังโหลด…' }: { text?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center text-brand">{text}</div>
  )
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-[#f6f7fb]">{children}</div>
  )
}

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-brand"
      />
    </label>
  )
}

const NAV = [
  { to: '/home', icon: '🏠', label: 'เรียน' },
  { to: '/review', icon: '🔁', label: 'ทบทวน' },
  { to: '/vocab', icon: '📖', label: 'คลังคำ' },
  { to: '/progress', icon: '📊', label: 'ก้าวหน้า' },
]

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 grid grid-cols-4 border-t border-gray-100 bg-white">
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-2 text-xs ${
              isActive ? 'font-semibold text-brand' : 'text-gray-400'
            }`
          }
        >
          <span className="text-lg">{n.icon}</span>
          {n.label}
        </NavLink>
      ))}
    </nav>
  )
}
