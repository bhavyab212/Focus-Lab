"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  duration: number
}

interface ConfettiProps {
  isActive: boolean
  duration?: number
}

const COLORS = [
  "#22c55e", // green
  "#16a34a", // dark green
  "#4ade80", // light green
  "#fbbf24", // amber
  "#f59e0b", // orange
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
]

export function Confetti({ isActive, duration = 3000 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isActive) {
      const newPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
      }))
      setPieces(newPieces)

      const timeout = setTimeout(() => {
        setPieces([])
      }, duration)

      return () => clearTimeout(timeout)
    }
  }, [isActive, duration])

  if (!mounted || pieces.length === 0) return null

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${piece.x}%`,
            top: "-20px",
            backgroundColor: piece.color,
            animation: `confetti-fall ${piece.duration}s linear ${piece.delay}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>,
    document.body,
  )
}
