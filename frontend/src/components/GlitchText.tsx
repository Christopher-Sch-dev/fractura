import { type FC, type ReactNode, useState } from 'react'

interface GlitchTextProps {
  children: ReactNode
  className?: string
  active?: boolean
  triggerOnHover?: boolean
}

export const GlitchText: FC<GlitchTextProps> = ({
  children,
  className = '',
  active = false,
  triggerOnHover = false,
}) => {
  const [isGlitching, setIsGlitching] = useState(false)

  const glitchClass = active || isGlitching
    ? 'glitch-text--active'
    : triggerOnHover && isGlitching
    ? 'glitch-text--hover'
    : ''

  return (
    <span
      className={`glitch-text ${glitchClass} ${className}`}
      onMouseEnter={() => triggerOnHover && setIsGlitching(true)}
      onMouseLeave={() => triggerOnHover && setIsGlitching(false)}
    >
      {children}
    </span>
  )
}