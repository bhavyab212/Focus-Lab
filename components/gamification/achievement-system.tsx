"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Lock, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { Achievement, Habit, PomodoroSession } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

// Extended achievements with more detail
const FULL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_step",
    name: "First Step",
    description: "Complete your first habit",
    icon: "⭐",
    unlocked: false,
    maxProgress: 1,
  },
  {
    id: "week_warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    unlocked: false,
    maxProgress: 7,
  },
  {
    id: "habit_master",
    name: "Habit Master",
    description: "Reach a 30-day streak",
    icon: "🏆",
    unlocked: false,
    maxProgress: 30,
  },
  {
    id: "century",
    name: "Century",
    description: "Complete 100 habit check-ins",
    icon: "💯",
    unlocked: false,
    maxProgress: 100,
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Complete morning habits 14 days",
    icon: "🌅",
    unlocked: false,
    maxProgress: 14,
  },
  {
    id: "perfect_week",
    name: "Perfect Week",
    description: "Complete all habits every day for a week",
    icon: "✨",
    unlocked: false,
    maxProgress: 7,
  },
  {
    id: "pomodoro_pro",
    name: "Pomodoro Pro",
    description: "Complete 50 pomodoro sessions",
    icon: "🍅",
    unlocked: false,
    maxProgress: 50,
  },
  {
    id: "focus_master",
    name: "Focus Master",
    description: "Complete a 2-hour flow session",
    icon: "🧘",
    unlocked: false,
    maxProgress: 1,
  },
  {
    id: "consistency_king",
    name: "Consistency King",
    description: "Track habits for 21 consecutive days",
    icon: "👑",
    unlocked: false,
    maxProgress: 21,
  },
  {
    id: "habit_collector",
    name: "Habit Collector",
    description: "Create 10 different habits",
    icon: "📚",
    unlocked: false,
    maxProgress: 10,
  },
  {
    id: "streak_saver",
    name: "Streak Saver",
    description: "Recover a streak after missing a day",
    icon: "🛡️",
    unlocked: false,
    maxProgress: 1,
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Complete evening habits for 14 days",
    icon: "🦉",
    unlocked: false,
    maxProgress: 14,
  },
]

interface AchievementSystemProps {
  habits: Habit[]
  pomodoroSessions?: PomodoroSession[]
}

export function AchievementSystem({ habits, pomodoroSessions = [] }: AchievementSystemProps) {
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>("focuslab-achievements", FULL_ACHIEVEMENTS)
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null)
  const [showAllAchievements, setShowAllAchievements] = useState(false)

  // Calculate achievement progress based on current data
  const calculatedAchievements = useMemo(() => {
    const totalCompletions = habits.reduce((acc, h) => acc + h.totalCompletions, 0)
    const maxStreak = Math.max(...habits.map((h) => h.currentStreak), 0)
    const longestStreak = Math.max(...habits.map((h) => h.longestStreak), 0)
    const pomodoroCount = pomodoroSessions.filter((s) => s.completedAt).length

    return achievements.map((achievement) => {
      let progress = 0
      let unlocked = achievement.unlocked

      switch (achievement.id) {
        case "first_step":
          progress = Math.min(totalCompletions, 1)
          unlocked = totalCompletions >= 1
          break
        case "week_warrior":
          progress = Math.min(maxStreak, 7)
          unlocked = maxStreak >= 7
          break
        case "habit_master":
          progress = Math.min(longestStreak, 30)
          unlocked = longestStreak >= 30
          break
        case "century":
          progress = Math.min(totalCompletions, 100)
          unlocked = totalCompletions >= 100
          break
        case "pomodoro_pro":
          progress = Math.min(pomodoroCount, 50)
          unlocked = pomodoroCount >= 50
          break
        case "habit_collector":
          progress = Math.min(habits.length, 10)
          unlocked = habits.length >= 10
          break
        case "consistency_king":
          progress = Math.min(longestStreak, 21)
          unlocked = longestStreak >= 21
          break
        default:
          progress = achievement.progress || 0
      }

      return {
        ...achievement,
        progress,
        unlocked,
        unlockedAt: unlocked && !achievement.unlocked ? new Date().toISOString() : achievement.unlockedAt,
      }
    })
  }, [habits, pomodoroSessions, achievements])

  // Check for newly unlocked achievements
  useEffect(() => {
    const newlyUnlockedAchievement = calculatedAchievements.find(
      (a) => a.unlocked && !achievements.find((prev) => prev.id === a.id)?.unlocked,
    )

    if (newlyUnlockedAchievement) {
      setNewlyUnlocked(newlyUnlockedAchievement)
      setShowUnlockDialog(true)
      setAchievements(calculatedAchievements)
    }
  }, [calculatedAchievements, achievements, setAchievements])

  const unlockedCount = calculatedAchievements.filter((a) => a.unlocked).length
  const totalCount = calculatedAchievements.length

  return (
    <>
      {/* Achievement Badge Button */}
      <button
        onClick={() => setShowAllAchievements(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
      >
        <Trophy className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-medium text-amber-600">
          {unlockedCount}/{totalCount}
        </span>
      </button>

      {/* Newly Unlocked Dialog */}
      <AnimatePresence>
        {showUnlockDialog && newlyUnlocked && (
          <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader className="sr-only">
                <DialogTitle>Achievement Unlocked</DialogTitle>
                <DialogDescription>You have unlocked the {newlyUnlocked.name} achievement</DialogDescription>
              </DialogHeader>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg"
                >
                  <span className="text-4xl">{newlyUnlocked.icon}</span>
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <h3 className="text-xl font-bold mb-1">Achievement Unlocked!</h3>
                  <p className="text-lg font-semibold text-amber-600">{newlyUnlocked.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">{newlyUnlocked.description}</p>
                </motion.div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* All Achievements Dialog */}
      <Dialog open={showAllAchievements} onOpenChange={setShowAllAchievements}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Achievements
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {unlockedCount} of {totalCount} unlocked
              </span>
            </DialogTitle>
            <DialogDescription>
              View your progress and unlocked achievements
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 mt-4">
            {calculatedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                  achievement.unlocked ? "bg-amber-500/5 border-amber-500/30" : "bg-muted/30 border-muted opacity-60",
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                    achievement.unlocked ? "bg-gradient-to-br from-amber-400 to-amber-600" : "bg-muted",
                  )}
                >
                  {achievement.unlocked ? (
                    <span className="text-2xl">{achievement.icon}</span>
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{achievement.name}</span>
                    {achievement.unlocked && <CheckCircle className="w-4 h-4 text-amber-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  {!achievement.unlocked && achievement.maxProgress && (
                    <div className="mt-1.5">
                      <Progress
                        value={((achievement.progress || 0) / achievement.maxProgress) * 100}
                        className="h-1.5"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {achievement.progress || 0} / {achievement.maxProgress}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
