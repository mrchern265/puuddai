import { useMemo } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

export function Button({
  variant = 'primary',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'accent' | 'ghost' | 'success'
}) {
  const base =
    'rounded-full px-6 py-3 font-bold transition active:scale-95 disabled:opacity-50 disabled:active:scale-100'
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-dark shadow-sm',
    accent: 'bg-accent text-white hover:bg-accent-dark shadow-sm',
    success: 'bg-success text-white hover:brightness-95 shadow-sm',
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
    <div className="min-h-screen w-full bg-gradient-to-b from-brand-light via-[#eef1f8] to-[#e7ecf7] sm:flex sm:justify-center sm:py-6">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#f6f7fb] shadow-xl ring-1 ring-black/5 sm:min-h-[calc(100vh-3rem)] sm:overflow-hidden sm:rounded-[2rem]">
        {children}
      </div>
    </div>
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

// ── Gamification components ──────────────────────────────────────────

// Lives display (❤️❤️🤍). Empty hearts dim out.
export function HeartBar({ lives, max = 3 }: { lives: number; max?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`เหลือ ${lives} หัวใจ`}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`text-xl leading-none transition ${i < lives ? '' : 'opacity-25 grayscale'}`}
        >
          ❤️
        </span>
      ))}
    </div>
  )
}

// Small pill stat (streak / XP / etc.)
export function StatChip({
  icon,
  value,
  className = '',
}: {
  icon: string
  value: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${className}`}
    >
      <span>{icon}</span>
      <span>{value}</span>
    </span>
  )
}

// Linear XP/progress bar with optional label.
export function XpBar({
  value,
  max,
  className = '',
  barClass = 'bg-gold',
}: {
  value: number
  max: number
  className?: string
  barClass?: string
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return (
    <div className={`h-3 w-full overflow-hidden rounded-full bg-black/10 ${className}`}>
      <div
        className={`h-full rounded-full ${barClass} transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// Circular progress ring with a big number in the middle.
export function ProgressRing({
  percent,
  size = 176,
  stroke = 14,
  children,
  track = 'rgba(255,255,255,0.25)',
  color = '#f5b301',
}: {
  percent: number
  size?: number
  stroke?: number
  children?: ReactNode
  track?: string
  color?: string
}) {
  const p = Math.max(0, Math.min(100, percent))
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (p / 100) * circ
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

// Up to 3 stars, filled based on how many earned.
export function Stars({ earned, total = 3, className = '' }: { earned: number; total?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`text-4xl animate-bounce-in ${i < earned ? '' : 'opacity-30 grayscale'}`}
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          ⭐
        </span>
      ))}
    </div>
  )
}

// Pure-CSS confetti burst — renders once, falls, and fades.
export function Confetti({ pieces = 42 }: { pieces?: number }) {
  const colors = ['#f5b301', '#1e4799', '#22a06b', '#e5484d', '#7c4dff', '#c8760a']
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.8 + Math.random() * 1.4,
        color: colors[i % colors.length],
        size: 7 + Math.random() * 7,
        rounded: Math.random() > 0.5,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pieces],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute top-0 block"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            background: b.color,
            borderRadius: b.rounded ? '9999px' : '2px',
            animation: `confetti-fall ${b.duration}s linear ${b.delay}s forwards`,
          }}
        />
      ))}
    </div>
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
