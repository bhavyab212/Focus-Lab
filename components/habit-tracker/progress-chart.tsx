"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { type Habit, DAYS_OF_WEEK } from "@/lib/types"

interface ProgressChartProps {
  habits: Habit[]
}

export function ProgressChart({ habits }: ProgressChartProps) {
  const dailyProgress = useMemo(() => {
    return DAYS_OF_WEEK.map((_, dayIndex) => {
      if (habits.length === 0) return 0
      const completedCount = habits.filter((h) => h.completedDays[dayIndex]).length
      return Math.round((completedCount / habits.length) * 100)
    })
  }, [habits])

  const overallProgress = useMemo(() => {
    if (habits.length === 0) return 0
    const totalPossible = habits.length * 7
    const totalCompleted = habits.reduce((acc, habit) => acc + habit.completedDays.filter(Boolean).length, 0)
    return Math.round((totalCompleted / totalPossible) * 100)
  }, [habits])

  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Overall Progress</h3>
        <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
      </div>

      <div className="flex items-end gap-2 h-32">
        {DAYS_OF_WEEK.map((day, index) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-muted rounded-t-sm relative h-24 flex items-end">
              <div
                className={cn(
                  "w-full rounded-t-sm transition-all duration-500",
                  dailyProgress[index] >= 70
                    ? "bg-primary"
                    : dailyProgress[index] >= 40
                      ? "bg-amber-500"
                      : "bg-muted-foreground/50",
                )}
                style={{ height: `${dailyProgress[index]}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{day}</span>
            <span className="text-xs font-medium">{dailyProgress[index]}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
