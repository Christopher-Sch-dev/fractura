import { useState } from 'react'

interface StatItemProps {
  stat: {
    label: string
    sub: string
    detail?: string
  }
  i: number
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'

export function StatItem({ stat, i }: StatItemProps) {
  const [displayText, setDisplayText] = useState(stat.label)

  const scramble = () => {
    let iteration = 0
    const iv = setInterval(() => {
      setDisplayText(
        stat.label.split('').map((_, idx) => {
          if (idx < iteration) return stat.label[idx]
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        }).join('')
      )
      iteration += 1 / 3
      if (iteration >= stat.label.length) clearInterval(iv)
    }, 30)
  }

  return (
    <div
      onMouseEnter={scramble}
      className="flex gap-8 group cursor-pointer items-center p-5 hover:bg-white/5 border border-transparent hover:border-[var(--color-primary-20)] transition-all duration-700 relative overflow-hidden"
      style={{ animationDelay: `${0.3 + i * 0.1}s` }}
    >
      <div className="w-12 h-12 bg-[var(--bg-deep)] border border-[var(--border-dim)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--color-primary)] group-hover:border-[var(--color-primary-40)] transition-all duration-700 group-hover:scale-110">
        <StatIcon index={i} />
      </div>
      <div className="flex flex-col">
        <p className="text-4xl font-black tracking-[-0.07em] leading-none mb-1 group-hover:text-[var(--color-primary)] transition-colors duration-500 glitch-text text-[var(--text-main)]">
          {displayText}
        </p>
        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] group-hover:text-[var(--color-primary)] transition-colors system-heartbeat">
          {stat.sub}
        </p>
        {stat.detail && (
          <p className="text-[9px] text-[var(--text-muted)] font-black italic mt-1 group-hover:text-[var(--text-main)] transition-colors uppercase tracking-widest opacity-60">
            {stat.detail}
          </p>
        )}
      </div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[var(--border-dim)] group-hover:border-[var(--color-primary-20)] opacity-0 group-hover:opacity-100 transition-all duration-700" />
    </div>
  )
}

function StatIcon({ index }: { index: number }) {
  const icons = ['$', '⬡', '⌂', '◈']
  return (
    <span className="text-lg font-black text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
      {icons[index] ?? '◉'}
    </span>
  )
}