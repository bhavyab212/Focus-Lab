"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import type { Habit, PomodoroSession } from "@/lib/types"

interface LevelSystemProps {
  habits: Habit[]
  pomodoroSessions?: PomodoroSession[]
}

// XP values for different actions
const XP_VALUES = {
  habitCompletion: 10,
  streakDay: 5,
  pomodoroSession: 15,
  achievementUnlock: 50,
}

// Level thresholds
const LEVELS = [
  { level: 1, xpRequired: 0, title: "Beginner", icon: "🌱" },
  { level: 2, xpRequired: 100, title: "Starter", icon: "🌿" },
  { level: 3, xpRequired: 250, title: "Learner", icon: "📚" },
  { level: 4, xpRequired: 500, title: "Dedicated", icon: "💪" },
  { level: 5, xpRequired: 1000, title: "Consistent", icon: "⭐" },
  { level: 6, xpRequired: 2000, title: "Achiever", icon: "🏆" },
  { level: 7, xpRequired: 3500, title: "Expert", icon: "💎" },
  { level: 8, xpRequired: 5500, title: "Master", icon: "👑" },
  { level: 9, xpRequired: 8000, title: "Legend", icon: "🔥" },
  { level: 10, xpRequired: 12000, title: "Transcendent", icon: "✨" },
]

export function LevelSystem({ habits, pomodoroSessions = [] }: LevelSystemProps) {
  const { totalXP, currentLevel, nextLevel, progress } = useMemo(() => {
    // Calculate total XP
    const habitXP = habits.reduce((acc, h) => acc + h.totalCompletions * XP_VALUES.habitCompletion, 0)
    const streakXP = habits.reduce((acc, h) => acc + h.currentStreak * XP_VALUES.streakDay, 0)
    const pomodoroXP = pomodoroSessions.filter((s) => s.completedAt).length * XP_VALUES.pomodoroSession

    const totalXP = habitXP + streakXP + pomodoroXP

    // Find current level
    let currentLevel = LEVELS[0]
    let nextLevel = LEVELS[1]

    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalXP >= LEVELS[i].xpRequired) {
        currentLevel = LEVELS[i]
        nextLevel = LEVELS[i + 1] || LEVELS[i]
        break
      }
    }

    // Calculate progress to next level
    const xpInCurrentLevel = totalXP - currentLevel.xpRequired
    const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired
    const progress = xpNeededForNext > 0 ? (xpInCurrentLevel / xpNeededForNext) * 100 : 100

    return { totalXP, currentLevel, nextLevel, progress }
  }, [habits, pomodoroSessions])

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
          >
            {currentLevel.icon}
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">Level {currentLevel.level}</span>
              <span className="text-sm text-primary font-medium">{currentLevel.title}</span>
            </div>
            <p className="text-xs text-muted-foreground">{totalXP.toLocaleString()} XP</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Next Level</p>
          <p className="text-sm font-medium">{nextLevel.xpRequired - totalXP} XP to go</p>
        </div>
      </div>

      <div className="space-y-1">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Lvl {currentLevel.level}</span>
          <span>Lvl {nextLevel.level}</span>
        </div>
      </div>
    </div>
  )
}
