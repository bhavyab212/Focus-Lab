"use client"

import { useMemo } from "react"
import { cn, formatDateISO } from "@/lib/utils"
import { type Task, DAYS_OF_WEEK } from "@/lib/types"
import { TrendingUp, Target, CheckCircle2 } from "lucide-react"

interface WeeklyStatsProps {
  weekDates: Date[]
  weekTasks: Record<string, Task[]>
}

export function WeeklyStats({ weekDates, weekTasks }: WeeklyStatsProps) {
  const stats = useMemo(() => {
    return weekDates.map((date, index) => {
      const dateKey = formatDateISO(date)
      const tasks = weekTasks[dateKey] || []
      const completed = tasks.filter((t) => t.completed).length
      const total = tasks.length
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0
      return { day: DAYS_OF_WEEK[index], completed, total, progress, hasData: total > 0 }
    })
  }, [weekDates, weekTasks])

  const overallStats = useMemo(() => {
    const allTasks = Object.values(weekTasks).flat()
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter((t) => t.completed).length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const bestDay = stats.reduce((best, curr) => (curr.progress > best.progress ? curr : best), {
      day: "N/A",
      progress: 0,
    })
    return { totalTasks, completedTasks, progress, bestDay }
  }, [weekTasks, stats])

  const maxHeight = 80

  return (
    <div className="bg-card rounded-xl border p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Weekly Overview</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{overallStats.totalTasks} tasks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-xl font-bold text-primary">{overallStats.progress}%</span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end gap-2 sm:gap-3 h-24">
        {stats.map((stat, index) => (
          <div key={stat.day} className="flex-1 flex flex-col items-center gap-1">
            <div className="text-[10px] sm:text-xs font-medium text-muted-foreground">
              {stat.hasData ? `${stat.progress}%` : "-"}
            </div>
            <div className="w-full bg-muted rounded-t-md h-16 flex items-end relative overflow-hidden">
              <div
                className={cn(
                  "w-full rounded-t-md transition-all duration-700 ease-out",
                  stat.progress >= 80
                    ? "bg-gradient-to-t from-primary to-primary/80"
                    : stat.progress >= 50
                      ? "bg-gradient-to-t from-amber-500 to-amber-400"
                      : stat.progress > 0
                        ? "bg-gradient-to-t from-orange-500 to-orange-400"
                        : "bg-transparent",
                )}
                style={{
                  height: stat.hasData ? `${Math.max((stat.progress / 100) * maxHeight, 4)}%` : "0%",
                }}
              />
            </div>
            <span
              className={cn(
                "text-[10px] sm:text-xs font-medium",
                index === new Date().getDay() ? "text-primary font-bold" : "text-muted-foreground",
              )}
            >
              {stat.day}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 pt-3 border-t">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">80%+</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">50-79%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">{"<50%"}</span>
        </div>
      </div>
    </div>
  )
}
