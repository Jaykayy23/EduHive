"use client"

import type { Achievement } from "@/lib/achievements"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AchievementBadge from "./AchievementBadge"
import { X } from "lucide-react"
import { Button } from "../ui/button"

interface AchievementNotificationProps {
  achievements: Achievement[]
  onDismiss: () => void
}

export default function AchievementNotification({ achievements, onDismiss }: AchievementNotificationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (achievements.length === 0) return

    const timer = setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setIsVisible(false)
        setTimeout(onDismiss, 300)
      }
    }, 4000)

    return () => clearTimeout(timer)
  }, [currentIndex, achievements.length, onDismiss])

  if (achievements.length === 0 || !isVisible) return null

  const currentAchievement = achievements[currentIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.8 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full mx-4"
      >
        <div className="bg-card border border-border rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-primary">🎉 Achievement Unlocked!</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setIsVisible(false)
                setTimeout(onDismiss, 300)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <AchievementBadge achievement={currentAchievement} size="lg" showDetails />

          {achievements.length > 1 && (
            <div className="flex justify-center mt-3 gap-1">
              {achievements.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
