export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col select-none group cursor-pointer ${className}`}>
      <div className="relative">
        <h1
          className="text-4xl font-black tracking-[-0.15em] leading-none text-[var(--text-main)] uppercase italic border-r-[6px] border-[var(--color-alert)] pr-4"
          style={{
            fontFamily: 'Inter, sans-serif',
            transform: 'skewX(-25deg)',
            textShadow: '4px 4px 0px rgba(239,68,68,0.4), -2px -2px 0px rgba(0,242,255,0.3)',
          }}
        >
          FRAC<span className="text-[var(--color-alert)]">T</span>URA
        </h1>
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[var(--color-alert)] opacity-0 group-hover:opacity-100 transition-all duration-300" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[8px] font-mono tracking-[0.5em] text-[var(--text-muted)] uppercase font-black italic">INTEL_FORK_v4.0</span>
        <div className="flex-1 h-[2px] bg-[var(--color-primary-20)] group-hover:bg-[var(--color-primary-40)] transition-colors" />
      </div>
    </div>
  )
}