"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate app initialization (checks auth, loads initial data, etc.)
    const timer = setTimeout(() => {
      setIsLoading(false)
      onComplete()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isLoading) return null

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent flex flex-col items-center justify-center z-[9999]"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        {/* Custom Icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="relative w-24 h-24"
        >
          <div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            {/* Fork and Spoon Icon */}
            <svg viewBox="0 0 100 100" className="w-16 h-16 text-primary" fill="currentColor">
              {/* Fork */}
              <path
                d="M25 30v40c0 5 3 8 6 8h2v10h4v-10h6v10h4v-10h2c3 0 6-3 6-8V30M33 30v6M39 30v6M45 30v6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              {/* Spoon */}
              <path
                d="M60 25c8 0 12 6 12 12s-4 12-12 12v20h4v10h-8v-10h4v-20c-8 0-12-6-12-12s4-12 12-12z"
                fill="currentColor"
              />
            </svg>
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-white tracking-tight">FoodiezX</h1>
          <p className="text-primary-foreground/80 text-lg mt-2">Order Food. Order Joy.</p>
        </motion.div>

        {/* Loading Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex gap-2 mt-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
              className="w-3 h-3 bg-white rounded-full"
            />
          ))}
        </motion.div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-white/70 text-sm mt-6"
        >
          Preparing delicious food for you...
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
