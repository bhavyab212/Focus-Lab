"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Target, TrendingUp, Clock, Zap, Lightbulb, ArrowRight, Flame, Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import { calculateHabitStrength, type HabitStrengthResult, DEFAULT_HABIT_STRENGTH_CONFIG } from "@/lib/habit-strength"
import type { Habit } from "@/lib/types"
import { Progress } from "@/components/ui/progress"

interface HabitStrengthCardProps {
  habit: Habit
  compact?: boolean
}

const CLASSIFICATION_COLORS = {
  nascent: { bg: "bg-slate-500/10", text: "text-slate-500", border: "border-slate-500/30" },
  developing: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  forming: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
  established: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30" },
  automatic: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
}

const CLASSIFICATION_LABELS = {
  nascent: "Just Started",
  developing: "Building",
  forming: "Taking Shape",
  established: "Strong",
  automatic: "Automatic",
}

export function HabitStrengthCard({ habit, compact = false }: HabitStrengthCardProps) {
  const strength = useMemo<HabitStrengthResult>(() => {
    return calculateHabitStrength(habit.completedDays, DEFAULT_HABIT_STRENGTH_CONFIG, habit.targetTimeOfDay)
  }, [habit.completedDays, habit.targetTimeOfDay])

  const colors = CLASSIFICATION_COLORS[strength.classification]

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
          colors.bg,
          colors.text,
          colors.border,
        )}
      >
        <Brain className="w-3 h-3" />
        <span>{strength.score}%</span>
        <span className="hidden sm:inline">Strength</span>
      </div>
    )
  }

  return (
    <motion.div
      className={cn("rounded-xl border p-5 space-y-4", colors.bg, colors.border)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {habit.icon && <span className="text-2xl">{habit.icon}</span>}
          <div>
            <h3 className="font-semibold">{habit.name}</h3>
            <p className={cn("text-xs", colors.text)}>{CLASSIFICATION_LABELS[strength.classification]}</p>
          </div>
        </div>
        <div className={cn("text-3xl font-bold", colors.text)}>{strength.score}%</div>
      </div>

      {/* Progress to Habit Formation */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress to Automatic</span>
          <span className="font-medium">{strength.progressToHabit}%</span>
        </div>
        <Progress value={strength.progressToHabit} className="h-2" />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>
            {strength.estimatedDaysToHabit > 0
              ? `~${strength.estimatedDaysToHabit} days to automatic habit`
              : "Habit formed!"}
          </span>
        </div>
      </div>

      {/* Component Scores */}
      <div className="grid grid-cols-2 gap-3">
        <ScoreItem icon={Target} label="Repetition" value={strength.repetitionScore} color="text-primary" />
        <ScoreItem icon={Flame} label="Recency" value={strength.recencyScore} color="text-orange-500" />
        <ScoreItem icon={TrendingUp} label="Consistency" value={strength.consistencyScore} color="text-blue-500" />
        <ScoreItem icon={Zap} label="Context" value={strength.contextScore} color="text-amber-500" />
      </div>

      {/* Recommendations */}
      {strength.recommendations.length > 0 && (
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Recommendations</span>
          </div>
          <ul className="space-y-1.5">
            {strength.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}

function ScoreItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Target
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
      <Icon className={cn("w-4 h-4", color)} />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground truncate">{label}</div>
        <div className="text-sm font-semibold">{value}%</div>
      </div>
    </div>
  )
}
