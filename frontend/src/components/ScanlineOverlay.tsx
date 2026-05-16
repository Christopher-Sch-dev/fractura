import { type FC } from 'react'
import '../styles/scanlines.css'

export const ScanlineOverlay: FC = () => {
  return (
    <>
      <div className="scanlines-overlay" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />
    </>
  )
}