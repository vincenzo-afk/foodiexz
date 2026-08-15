import { useState } from "react"
import { motion } from "motion/react"

interface ConfettiPiece {
  id: number
  x: number
  delay: number
  duration: number
  color: string
}

const createPieces = (): ConfettiPiece[] => {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE"]
  return Array.from({ length: 50 }, (_, id) => ({
    id,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))
}

export function Confetti() {
  const [pieces] = useState<ConfettiPiece[]>(createPieces)

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ y: -20, x: `${piece.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "100vh", rotate: 360, opacity: 0 }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: "easeIn" }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: piece.color }}
        />
      ))}
    </div>
  )
}
