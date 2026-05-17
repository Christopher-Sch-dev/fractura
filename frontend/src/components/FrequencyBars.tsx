import { useEffect, useRef } from 'react'

interface FrequencyBarsProps {
  mode?: 'landing' | 'detail'
}

export function FrequencyBars({ mode = 'landing' }: FrequencyBarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let phase = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight

      ctx.clearRect(0, 0, w, h)

      const bars = mode === 'detail' ? 32 : 24
      const gap = 3
      const barW = (w - gap * (bars - 1)) / bars

      const baseColor = mode === 'detail' ? [255, 32, 64] : [0, 229, 255]
      const [r, g, b] = baseColor

      for (let i = 0; i < bars; i++) {
        const freq = 0.4 + Math.sin(phase * 0.045 + i * 0.4) * 0.3 + Math.sin(phase * 0.02 + i * 0.15) * 0.3
        const barH = Math.max(4, freq * h * 0.9)
        const x = i * (barW + gap)
        const y = h - barH

        const alpha = 0.15 + freq * 0.3
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`

        const grad = ctx.createLinearGradient(x, y, x, y + barH)
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 1.5})`)
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
        ctx.fillStyle = grad
        ctx.fillRect(x, y, barW, barH)

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.7})`
        ctx.fillRect(x, y + barH * 0.65, barW, barH * 0.35)
      }

      phase += mode === 'detail' ? 1.5 : 1
      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [mode])

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-3 right-3 pointer-events-none"
      style={{
        width: mode === 'detail' ? 160 : 120,
        height: mode === 'detail' ? 48 : 36,
        opacity: mode === 'detail' ? 0.5 : 0.3
      }}
    />
  )
}