import { useEffect, useRef } from 'react'

export function FrequencyBars() {
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

      const bars = 24
      const gap = 3
      const barW = (w - gap * (bars - 1)) / bars

      for (let i = 0; i < bars; i++) {
        const freq = 0.4 + Math.sin(phase * 0.04 + i * 0.35) * 0.3 + Math.sin(phase * 0.017 + i * 0.12) * 0.3
        const barH = Math.max(4, freq * h * 0.9)
        const x = i * (barW + gap)
        const y = h - barH

        const alpha = 0.15 + freq * 0.25
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`

        // Top glow
        const grad = ctx.createLinearGradient(x, y, x, y + barH)
        grad.addColorStop(0, `rgba(0, 229, 255, ${alpha * 1.5})`)
        grad.addColorStop(1, `rgba(0, 229, 255, 0)`)
        ctx.fillStyle = grad
        ctx.fillRect(x, y, barW, barH)

        // Solid base
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha * 0.6})`
        ctx.fillRect(x, y + barH * 0.7, barW, barH * 0.3)
      }

      phase++
      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-2 right-2 opacity-30"
      style={{ width: 120, height: 36, pointerEvents: 'none' }}
    />
  )
}