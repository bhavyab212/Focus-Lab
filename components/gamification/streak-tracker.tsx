"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Flame, TrendingUp, Calendar, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Habit } from "@/lib/types"

interface StreakTrackerProps {
  habits: Habit[]
}

export function StreakTracker({ habits }: StreakTrackerProps) {
  const stats = useMemo(() => {
    const activeStreaks = habits.filter((h) => h.currentStreak > 0)
    const totalCompletions = habits.reduce((acc, h) => acc + h.totalCompletions, 0)
    const bestCurrentStreak = Math.max(...habits.map((h) => h.currentStreak), 0)
    const allTimeBestStreak = Math.max(...habits.map((h) => h.longestStreak), 0)

    // Calculate average completion rate (last 30 days approximation)
    const avgCompletionRate = habits.length > 0 ? Math.round((totalCompletions / (habits.length * 30)) * 100) : 0

    return {
      activeStreaks: activeStreaks.length,
      totalStreakDays: activeStreaks.reduce((acc, h) => acc + h.currentStreak, 0),
      bestCurrentStreak,
      allTimeBestStreak,
      totalCompletions,
      avgCompletionRate: Math.min(avgCompletionRate, 100),
    }
  }, [habits])

  const getStreakLevel = (streak: number) => {
    if (streak >= 66) return { name: "Automatic", color: "text-purple-500", bg: "bg-purple-500" }
    if (streak >= 30) return { name: "Established", color: "text-emerald-500", bg: "bg-emerald-500" }
    if (streak >= 21) return { name: "Forming", color: "text-blue-500", bg: "bg-blue-500" }
    if (streak >= 7) return { name: "Developing", color: "text-amber-500", bg: "bg-amber-500" }
    return { name: "Nascent", color: "text-muted-foreground", bg: "bg-muted" }
  }

  const currentLevel = getStreakLevel(stats.bestCurrentStreak)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="w-5 h-5 text-orange-500" />
          Streak Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main streak display */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Best Active Streak</p>
            <div className="flex items-baseline gap-1">
              <motion.span
                className="text-4xl font-bold text-orange-500"
                key={stats.bestCurrentStreak}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {stats.bestCurrentStreak}
              </motion.span>
              <span className="text-lg text-muted-foreground">days</span>
            </div>
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", currentLevel.bg, "text-white")}>
              {currentLevel.name}
            </span>
          </div>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="text-5xl"
          >
            🔥
          </motion.div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-3.5 h-3.5" />
              <span className="text-xs">Active Streaks</span>
            </div>
            <p className="text-xl font-bold">{stats.activeStreaks}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-xs">All-Time Best</span>
            </div>
            <p className="text-xl font-bold">{stats.allTimeBestStreak}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs">Total Check-ins</span>
            </div>
            <p className="text-xl font-bold">{stats.totalCompletions}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-xs">Streak Days</span>
            </div>
            <p className="text-xl font-bold">{stats.totalStreakDays}</p>
          </div>
        </div>

        {/* Habit streaks list */}
        {habits.filter((h) => h.currentStreak > 0).length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Active Habit Streaks</p>
            {habits
              .filter((h) => h.currentStreak > 0)
              .sort((a, b) => b.currentStreak - a.currentStreak)
              .slice(0, 5)
              .map((habit) => {
                const level = getStreakLevel(habit.currentStreak)
                return (
                  <div key={habit.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                    <span className="text-lg">{habit.icon || "🎯"}</span>
                    <span className="flex-1 text-sm truncate">{habit.name}</span>
                    <div className="flex items-center gap-1">
                      <Flame className={cn("w-3.5 h-3.5", level.color)} />
                      <span className={cn("text-sm font-bold", level.color)}>{habit.currentStreak}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
