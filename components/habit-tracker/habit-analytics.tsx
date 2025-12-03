"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  Flame,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Zap,
  Award,
  Star,
  Brain,
  Clock,
  ArrowRight,
  Lightbulb,
} from "lucide-react"
import { cn, formatDateISO } from "@/lib/utils"
import type { Habit } from "@/lib/types"
import {
  calculateHabitStrength,
  DEFAULT_HABIT_STRENGTH_CONFIG,
  getHabitStackingSuggestions,
  generateImplementationIntention,
} from "@/lib/habit-strength"
import { Progress } from "@/components/ui/progress"

interface HabitAnalyticsProps {
  habits: Habit[]
  selectedHabit: Habit | null
}

export function HabitAnalytics({ habits, selectedHabit }: HabitAnalyticsProps) {
  const analytics = useMemo(() => {
    const allCompletions = habits.flatMap((h) =>
      Object.entries(h.completedDays)
        .filter(([_, completed]) => completed)
        .map(([date]) => ({ date, habitId: h.id })),
    )

    // Best day of week
    const dayCompletions = [0, 0, 0, 0, 0, 0, 0]
    allCompletions.forEach(({ date }) => {
      const day = new Date(date).getDay()
      dayCompletions[day]++
    })
    const bestDayIndex = dayCompletions.indexOf(Math.max(...dayCompletions))
    const bestDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][bestDayIndex]

    // Total stats
    const totalCompletions = allCompletions.length
    const totalPossible = habits.length * 30 // Last 30 days
    const overallRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0

    // Current active streaks
    const activeStreaks = habits.filter((h) => h.currentStreak > 0).length

    // Longest ever streak
    const longestStreak = Math.max(...habits.map((h) => h.longestStreak), 0)

    // Most consistent habit
    const mostConsistent = habits.reduce(
      (best, current) => (current.totalCompletions > (best?.totalCompletions || 0) ? current : best),
      habits[0],
    )

    // Weekly trend (last 4 weeks)
    const weeklyData = Array.from({ length: 4 }, (_, weekIndex) => {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (weekIndex + 1) * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const completions = allCompletions.filter(({ date }) => {
        const d = new Date(date)
        return d >= weekStart && d < weekEnd
      }).length

      return { week: `Week ${4 - weekIndex}`, completions }
    }).reverse()

    // Calculate habit strengths for all habits
    const habitStrengths = habits
      .map((habit) => ({
        ...habit,
        strength: calculateHabitStrength(habit.completedDays, DEFAULT_HABIT_STRENGTH_CONFIG, habit.targetTimeOfDay),
      }))
      .sort((a, b) => b.strength.score - a.strength.score)

    // Average habit strength
    const avgStrength =
      habitStrengths.length > 0
        ? Math.round(habitStrengths.reduce((sum, h) => sum + h.strength.score, 0) / habitStrengths.length)
        : 0

    return {
      totalCompletions,
      overallRate,
      activeStreaks,
      longestStreak,
      mostConsistent,
      bestDay,
      weeklyData,
      dayCompletions,
      habitStrengths,
      avgStrength,
    }
  }, [habits])

  const habitStats = useMemo(() => {
    if (!selectedHabit) return null

    const completedDates = Object.entries(selectedHabit.completedDays)
      .filter(([_, completed]) => completed)
      .map(([date]) => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime())

    // Last 30 days heatmap data
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      const dateKey = formatDateISO(date)
      return {
        date,
        completed: selectedHabit.completedDays[dateKey] || false,
      }
    })

    // Calculate habit strength
    const strength = calculateHabitStrength(
      selectedHabit.completedDays,
      DEFAULT_HABIT_STRENGTH_CONFIG,
      selectedHabit.targetTimeOfDay,
    )

    // Get habit stacking suggestions
    const stackingSuggestions = getHabitStackingSuggestions(
      habits
        .filter((h) => h.id !== selectedHabit.id)
        .map((h) => ({
          name: h.name,
          strength: calculateHabitStrength(h.completedDays).score,
        })),
      selectedHabit.name,
    )

    // Generate implementation intention
    const implementationIntention = generateImplementationIntention(
      selectedHabit.name,
      selectedHabit.targetTimeOfDay === "morning"
        ? "7:00 AM"
        : selectedHabit.targetTimeOfDay === "afternoon"
          ? "1:00 PM"
          : selectedHabit.targetTimeOfDay === "evening"
            ? "7:00 PM"
            : undefined,
    )

    return {
      ...selectedHabit,
      last30Days,
      completionRate: Math.round((selectedHabit.totalCompletions / 30) * 100),
      strength,
      stackingSuggestions,
      implementationIntention,
    }
  }, [selectedHabit, habits])

  const statCards = [
    {
      label: "Total Completions",
      value: analytics.totalCompletions,
      icon: Target,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Avg Habit Strength",
      value: `${analytics.avgStrength}%`,
      icon: Brain,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Active Streaks",
      value: analytics.activeStreaks,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Longest Streak",
      value: `${analytics.longestStreak} days`,
      icon: Trophy,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ]

  return (
    <div className="space-y-6 py-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-muted/30 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Habit Strength Ranking */}
      <div className="bg-muted/20 rounded-xl p-5">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-500" />
          Habit Strength Ranking
        </h4>
        <div className="space-y-3">
          {analytics.habitStrengths.slice(0, 5).map((habit, index) => (
            <div key={habit.id} className="flex items-center gap-3">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  index === 0
                    ? "bg-amber-500 text-white"
                    : index === 1
                      ? "bg-slate-400 text-white"
                      : index === 2
                        ? "bg-amber-700 text-white"
                        : "bg-muted text-muted-foreground",
                )}
              >
                {index + 1}
              </div>
              <span className="text-lg">{habit.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{habit.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{habit.strength.classification}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">{habit.strength.score}%</div>
                <div className="text-xs text-muted-foreground">
                  {habit.strength.estimatedDaysToHabit > 0 ? `${habit.strength.estimatedDaysToHabit}d left` : "Formed!"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-muted/20 rounded-xl p-5">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Weekly Trend
        </h4>
        <div className="flex items-end gap-3 h-32">
          {analytics.weeklyData.map((week, index) => {
            const maxCompletions = Math.max(...analytics.weeklyData.map((w) => w.completions), 1)
            const height = (week.completions / maxCompletions) * 100

            return (
              <div key={week.week} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="w-full bg-primary/20 rounded-t-lg relative overflow-hidden"
                  style={{ height: `${height}%`, minHeight: 4 }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-primary to-primary/60" />
                </motion.div>
                <span className="text-xs text-muted-foreground">{week.week}</span>
                <span className="text-xs font-semibold">{week.completions}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day of Week Performance */}
      <div className="bg-muted/20 rounded-xl p-5">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Best Days
        </h4>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => {
            const maxDay = Math.max(...analytics.dayCompletions)
            const intensity = maxDay > 0 ? analytics.dayCompletions[index] / maxDay : 0
            const isBest = index === analytics.dayCompletions.indexOf(maxDay) && maxDay > 0

            return (
              <div key={day} className="text-center">
                <motion.div
                  className={cn(
                    "w-full aspect-square rounded-lg flex items-center justify-center text-xs font-semibold mb-1 transition-colors",
                    isBest
                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                      : intensity > 0.7
                        ? "bg-primary/70 text-primary-foreground"
                        : intensity > 0.4
                          ? "bg-primary/40 text-foreground"
                          : intensity > 0
                            ? "bg-primary/20 text-foreground"
                            : "bg-muted text-muted-foreground",
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 500, damping: 30 }}
                >
                  {analytics.dayCompletions[index]}
                </motion.div>
                <span className="text-[10px] text-muted-foreground">{day}</span>
              </div>
            )
          })}
        </div>
        <p className="text-sm text-muted-foreground mt-3 text-center">
          Your best day is <span className="font-semibold text-foreground">{analytics.bestDay}</span>
        </p>
      </div>

      {/* Selected Habit Detail with Strength Analysis */}
      {habitStats && (
        <motion.div
          className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            {habitStats.icon && <span className="text-2xl">{habitStats.icon}</span>}
            <div>
              <h4 className="font-semibold">{habitStats.name}</h4>
              <p className="text-xs text-muted-foreground">Last 30 days activity</p>
            </div>
          </div>

          {/* Strength Score */}
          <div className="bg-background/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium">Habit Strength</span>
              </div>
              <span
                className={cn(
                  "text-xl font-bold",
                  habitStats.strength.score >= 70
                    ? "text-primary"
                    : habitStats.strength.score >= 40
                      ? "text-amber-500"
                      : "text-orange-500",
                )}
              >
                {habitStats.strength.score}%
              </span>
            </div>
            <Progress value={habitStats.strength.progressToHabit} className="h-2 mb-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="capitalize">{habitStats.strength.classification}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {habitStats.strength.estimatedDaysToHabit > 0
                  ? `~${habitStats.strength.estimatedDaysToHabit} days to automatic`
                  : "Habit formed!"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-primary">{habitStats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-amber-500">{habitStats.longestStreak}</div>
              <div className="text-xs text-muted-foreground">Longest Streak</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-500">{habitStats.totalCompletions}</div>
              <div className="text-xs text-muted-foreground">Total Done</div>
            </div>
          </div>

          {/* 30-day heatmap */}
          <div className="grid grid-cols-10 gap-1">
            {habitStats.last30Days.map((day, index) => (
              <motion.div
                key={index}
                className={cn(
                  "aspect-square rounded-sm transition-colors",
                  day.completed ? "bg-primary" : "bg-muted/50",
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.02, type: "spring", stiffness: 500, damping: 30 }}
                title={formatDateISO(day.date)}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>30 days ago</span>
            <span>Today</span>
          </div>

          {/* Recommendations */}
          {habitStats.strength.recommendations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Recommendations</span>
              </div>
              <ul className="space-y-1.5">
                {habitStats.strength.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Habit Stacking */}
          {habitStats.stackingSuggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>Habit Stacking Ideas</span>
              </div>
              <ul className="space-y-1.5">
                {habitStats.stackingSuggestions.map((suggestion, index) => (
                  <li key={index} className="text-xs text-muted-foreground p-2 bg-background/50 rounded-lg">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Achievements */}
      <div className="bg-muted/20 rounded-xl p-5">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-violet-500" />
          Achievements
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "First Step", desc: "Complete first habit", unlocked: analytics.totalCompletions >= 1, icon: Star },
            { name: "Week Warrior", desc: "7 day streak", unlocked: analytics.longestStreak >= 7, icon: Flame },
            { name: "Habit Master", desc: "30 day streak", unlocked: analytics.longestStreak >= 30, icon: Trophy },
            { name: "Strong Mind", desc: "Avg strength 50%+", unlocked: analytics.avgStrength >= 50, icon: Brain },
            { name: "Consistent", desc: "5 active streaks", unlocked: analytics.activeStreaks >= 5, icon: TrendingUp },
            { name: "Century", desc: "100 completions", unlocked: analytics.totalCompletions >= 100, icon: Target },
          ].map((achievement, index) => (
            <motion.div
              key={achievement.name}
              className={cn(
                "p-3 rounded-lg text-center transition-all",
                achievement.unlocked
                  ? "bg-gradient-to-br from-amber-500/20 to-amber-500/10 border border-amber-500/30"
                  : "bg-muted/30 opacity-50",
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 500, damping: 30 }}
            >
              <achievement.icon
                className={cn(
                  "w-6 h-6 mx-auto mb-2",
                  achievement.unlocked ? "text-amber-500" : "text-muted-foreground",
                )}
              />
              <div className="text-xs font-semibold">{achievement.name}</div>
              <div className="text-[10px] text-muted-foreground">{achievement.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
