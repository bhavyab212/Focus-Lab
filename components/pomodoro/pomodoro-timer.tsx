"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Coffee,
  Brain,
  Zap,
  Timer,
  Waves,
  Target,
  Link2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { cn, formatTime } from "@/lib/utils"
import { type PomodoroSettings, DEFAULT_POMODORO_SETTINGS, type Task, type Habit } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Confetti } from "@/components/ui/confetti"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type TimerState = "idle" | "running" | "paused"
type SessionType = "work" | "short-break" | "long-break"
type TimerMode = "pomodoro" | "flow" | "timer"

interface PomodoroTimerProps {
  compact?: boolean
  onSessionComplete?: (type: SessionType, taskId?: string, habitId?: string) => void
  tasks?: Task[]
  habits?: Habit[]
}

export function PomodoroTimer({ compact = false, onSessionComplete, tasks = [], habits = [] }: PomodoroTimerProps) {
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>(
    "focuslab-pomodoro-settings",
    DEFAULT_POMODORO_SETTINGS,
  )
  const [state, setState] = useState<TimerState>("idle")
  const [sessionType, setSessionType] = useState<SessionType>("work")
  const [timerMode, setTimerMode] = useState<TimerMode>("pomodoro")
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60)
  const [customTimerDuration, setCustomTimerDuration] = useState(25)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [totalPomodoros, setTotalPomodoros] = useLocalStorage<number>("focuslab-total-pomodoros", 0)
  const [flowStartTime, setFlowStartTime] = useState<number | null>(null)
  const [flowElapsed, setFlowElapsed] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [linkedTaskId, setLinkedTaskId] = useState<string | null>(null)
  const [linkedHabitId, setLinkedHabitId] = useState<string | null>(null)
  const [sessionHistory, setSessionHistory] = useLocalStorage<
    Array<{
      id: string
      type: SessionType
      mode: TimerMode
      duration: number
      completedAt: string
      taskId?: string
      habitId?: string
    }>
  >("focuslab-session-history", [])

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const tickAudioRef = useRef<HTMLAudioElement | null>(null)

  const getDuration = useCallback(
    (type: SessionType) => {
      switch (type) {
        case "work":
          return settings.workDuration * 60
        case "short-break":
          return settings.shortBreakDuration * 60
        case "long-break":
          return settings.longBreakDuration * 60
      }
    },
    [settings],
  )

  const playSound = useCallback(() => {
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }, [settings.soundEnabled])

  const triggerHaptic = useCallback(() => {
    if (settings.hapticFeedback && navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  }, [settings.hapticFeedback])

  const handleSessionComplete = useCallback(() => {
    playSound()
    triggerHaptic()

    const session = {
      id: Date.now().toString(),
      type: sessionType,
      mode: timerMode,
      duration: timerMode === "flow" ? flowElapsed : getDuration(sessionType) - timeLeft,
      completedAt: new Date().toISOString(),
      taskId: linkedTaskId || undefined,
      habitId: linkedHabitId || undefined,
    }

    setSessionHistory((prev) => [session, ...prev].slice(0, 100))

    if (sessionType === "work") {
      const newCompleted = completedSessions + 1
      setCompletedSessions(newCompleted)
      setTotalPomodoros((prev) => prev + 1)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)

      if (newCompleted % settings.sessionsBeforeLongBreak === 0) {
        setSessionType("long-break")
        setTimeLeft(getDuration("long-break"))
      } else {
        setSessionType("short-break")
        setTimeLeft(getDuration("short-break"))
      }

      if (settings.autoStartBreaks) {
        setState("running")
      } else {
        setState("idle")
      }
    } else {
      setSessionType("work")
      setTimeLeft(getDuration("work"))

      if (settings.autoStartPomodoros) {
        setState("running")
      } else {
        setState("idle")
      }
    }

    onSessionComplete?.(sessionType, linkedTaskId || undefined, linkedHabitId || undefined)
  }, [
    sessionType,
    completedSessions,
    settings,
    getDuration,
    playSound,
    triggerHaptic,
    onSessionComplete,
    setTotalPomodoros,
    timerMode,
    flowElapsed,
    timeLeft,
    linkedTaskId,
    linkedHabitId,
    setSessionHistory,
  ])

  // Pomodoro/Timer countdown
  useEffect(() => {
    if (timerMode !== "flow" && state === "running" && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete()
            return 0
          }
          // Play tick sound every second if enabled
          if (settings.tickingSound && tickAudioRef.current && prev % 60 === 0) {
            tickAudioRef.current.play().catch(() => {})
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state, timeLeft, handleSessionComplete, timerMode, settings.tickingSound])

  // Flow mode counter
  useEffect(() => {
    if (timerMode === "flow" && state === "running") {
      intervalRef.current = setInterval(() => {
        setFlowElapsed((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state, timerMode])

  const toggleTimer = () => {
    if (state === "running") {
      setState("paused")
    } else {
      if (timerMode === "flow" && state === "idle") {
        setFlowStartTime(Date.now())
        setFlowElapsed(0)
      }
      setState("running")
    }
  }

  const resetTimer = () => {
    setState("idle")
    if (timerMode === "flow") {
      setFlowElapsed(0)
      setFlowStartTime(null)
    } else if (timerMode === "timer") {
      setTimeLeft(customTimerDuration * 60)
    } else {
      setTimeLeft(getDuration(sessionType))
    }
  }

  const switchSession = (type: SessionType) => {
    setState("idle")
    setSessionType(type)
    setTimeLeft(getDuration(type))
  }

  const switchMode = (mode: TimerMode) => {
    setState("idle")
    setTimerMode(mode)
    if (mode === "flow") {
      setFlowElapsed(0)
      setFlowStartTime(null)
    } else if (mode === "timer") {
      setTimeLeft(customTimerDuration * 60)
    } else {
      setTimeLeft(getDuration(sessionType))
    }
  }

  const progress =
    timerMode === "flow"
      ? Math.min(1, flowElapsed / (2 * 60 * 60)) // Max 2 hours for visualization
      : 1 - timeLeft / getDuration(sessionType)
  const circumference = 2 * Math.PI * 45

  const getSessionColor = () => {
    if (timerMode === "flow") return "text-violet-500"
    switch (sessionType) {
      case "work":
        return "text-primary"
      case "short-break":
        return "text-blue-500"
      case "long-break":
        return "text-violet-500"
    }
  }

  const getSessionBg = () => {
    if (timerMode === "flow") return "from-violet-500/20 to-violet-500/5"
    switch (sessionType) {
      case "work":
        return "from-primary/20 to-primary/5"
      case "short-break":
        return "from-blue-500/20 to-blue-500/5"
      case "long-break":
        return "from-violet-500/20 to-violet-500/5"
    }
  }

  const displayTime = timerMode === "flow" ? flowElapsed : timeLeft

  // Get linked item names
  const linkedTask = tasks.find((t) => t.id === linkedTaskId)
  const linkedHabit = habits.find((h) => h.id === linkedHabitId)

  if (compact) {
    return (
      <motion.div
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-full glass border",
          state === "running" && "animate-pulse-ring",
        )}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className={cn("font-mono text-lg font-bold", getSessionColor())}>{formatTime(displayTime)}</div>
        <Button variant="ghost" size="sm" onClick={toggleTimer} className="h-8 w-8 p-0 rounded-full">
          {state === "running" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
      </motion.div>
    )
  }

  return (
    <>
      <Confetti isActive={showConfetti} />
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleA4aZI/ZxKJfChw/j8/IpGA4Gl+DwMOjYiMbWn65wqVoI"
      />
      <audio ref={tickAudioRef} src="data:audio/wav;base64,UklGRl9vT19teleUgAAABAAIAAgAAAABAAEABCAAAAB" />

      <motion.div
        className={cn("bg-gradient-to-br rounded-2xl border p-6 relative overflow-hidden", getSessionBg())}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Flow mode indicator */}
        {settings.flowModeEnabled && timerMode === "flow" && state === "running" && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5 animate-pulse" />
          </motion.div>
        )}

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/30 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {timerMode === "flow" ? (
                <Waves className={cn("w-5 h-5", getSessionColor())} />
              ) : timerMode === "timer" ? (
                <Timer className={cn("w-5 h-5", getSessionColor())} />
              ) : sessionType === "work" ? (
                <Brain className={cn("w-5 h-5", getSessionColor())} />
              ) : (
                <Coffee className={cn("w-5 h-5", getSessionColor())} />
              )}
              <h3 className="font-semibold text-foreground">
                {timerMode === "flow"
                  ? "Flow Mode"
                  : timerMode === "timer"
                    ? "Timer"
                    : sessionType === "work"
                      ? "Focus Time"
                      : sessionType === "short-break"
                        ? "Short Break"
                        : "Long Break"}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                className="h-8 w-8 p-0"
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Timer Settings</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="timing" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="timing">Timing</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>
                    <TabsContent value="timing" className="space-y-4 py-4">
                      <div className="flex items-center justify-between">
                        <Label>Work Duration (minutes)</Label>
                        <Input
                          type="number"
                          value={settings.workDuration}
                          onChange={(e) => setSettings((prev) => ({ ...prev, workDuration: Number(e.target.value) }))}
                          className="w-20"
                          min={1}
                          max={120}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Short Break (minutes)</Label>
                        <Input
                          type="number"
                          value={settings.shortBreakDuration}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, shortBreakDuration: Number(e.target.value) }))
                          }
                          className="w-20"
                          min={1}
                          max={30}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Long Break (minutes)</Label>
                        <Input
                          type="number"
                          value={settings.longBreakDuration}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, longBreakDuration: Number(e.target.value) }))
                          }
                          className="w-20"
                          min={1}
                          max={60}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Sessions before long break</Label>
                        <Input
                          type="number"
                          value={settings.sessionsBeforeLongBreak}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, sessionsBeforeLongBreak: Number(e.target.value) }))
                          }
                          className="w-20"
                          min={2}
                          max={10}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="advanced" className="space-y-4 py-4">
                      <div className="flex items-center justify-between">
                        <Label>Auto-start breaks</Label>
                        <Switch
                          checked={settings.autoStartBreaks}
                          onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoStartBreaks: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Auto-start pomodoros</Label>
                        <Switch
                          checked={settings.autoStartPomodoros}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({ ...prev, autoStartPomodoros: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Sound notifications</Label>
                        <Switch
                          checked={settings.soundEnabled}
                          onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, soundEnabled: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Haptic feedback</Label>
                        <Switch
                          checked={settings.hapticFeedback}
                          onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, hapticFeedback: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Ticking sound (minute marks)</Label>
                        <Switch
                          checked={settings.tickingSound}
                          onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, tickingSound: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Enable Flow Mode</Label>
                        <Switch
                          checked={settings.flowModeEnabled}
                          onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, flowModeEnabled: checked }))}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => switchMode("pomodoro")}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1",
                timerMode === "pomodoro"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50",
              )}
            >
              <Brain className="w-3.5 h-3.5" />
              Pomodoro
            </button>
            {settings.flowModeEnabled && (
              <button
                onClick={() => switchMode("flow")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1",
                  timerMode === "flow"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                )}
              >
                <Waves className="w-3.5 h-3.5" />
                Flow
              </button>
            )}
            <button
              onClick={() => switchMode("timer")}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1",
                timerMode === "timer"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50",
              )}
            >
              <Timer className="w-3.5 h-3.5" />
              Timer
            </button>
          </div>

          {/* Session Type Selector (only for pomodoro mode) */}
          {timerMode === "pomodoro" && (
            <div className="flex gap-2 mb-4">
              {(["work", "short-break", "long-break"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => switchSession(type)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                    sessionType === type
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                  )}
                >
                  {type === "work" ? "Focus" : type === "short-break" ? "Short" : "Long"}
                </button>
              ))}
            </div>
          )}

          {/* Custom Timer Duration (only for timer mode) */}
          {timerMode === "timer" && state === "idle" && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-background/50 rounded-lg">
              <Label className="text-sm">Duration:</Label>
              <Input
                type="number"
                value={customTimerDuration}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setCustomTimerDuration(val)
                  setTimeLeft(val * 60)
                }}
                className="w-20"
                min={1}
                max={180}
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          )}

          {/* Task/Habit Attribution */}
          {(tasks.length > 0 || habits.length > 0) && (
            <div className="flex gap-2 mb-4">
              {tasks.length > 0 && (
                <Select value={linkedTaskId || "none"} onValueChange={(v) => setLinkedTaskId(v === "none" ? null : v)}>
                  <SelectTrigger className="flex-1 h-9 text-xs">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {linkedTask ? linkedTask.title.slice(0, 20) : "Link Task"}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No task</SelectItem>
                    {tasks
                      .filter((t) => !t.completed)
                      .map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
              {habits.length > 0 && (
                <Select
                  value={linkedHabitId || "none"}
                  onValueChange={(v) => setLinkedHabitId(v === "none" ? null : v)}
                >
                  <SelectTrigger className="flex-1 h-9 text-xs">
                    <div className="flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      {linkedHabit ? `${linkedHabit.icon} ${linkedHabit.name.slice(0, 15)}` : "Link Habit"}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No habit</SelectItem>
                    {habits.map((habit) => (
                      <SelectItem key={habit.id} value={habit.id}>
                        {habit.icon} {habit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Timer Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/30"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className={getSessionColor()}
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference * (1 - progress) }}
                  transition={{ duration: 0.5, ease: "linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="font-mono text-4xl font-bold"
                  key={displayTime}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  {formatTime(displayTime)}
                </motion.span>
                <span className="text-xs text-muted-foreground mt-1">
                  {timerMode === "flow"
                    ? "Flow Session"
                    : timerMode === "timer"
                      ? "Timer"
                      : `Session ${completedSessions + 1}`}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              className="h-12 w-12 rounded-full bg-transparent"
              disabled={
                state === "idle" && (timerMode === "flow" ? flowElapsed === 0 : timeLeft === getDuration(sessionType))
              }
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              onClick={toggleTimer}
              size="lg"
              className={cn("h-14 w-14 rounded-full shadow-lg transition-all", state === "running" && "animate-pulse")}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={state}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  {state === "running" ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </motion.div>
              </AnimatePresence>
            </Button>
            <div className="h-12 w-12 flex items-center justify-center">
              <div className="flex items-center gap-1 text-sm">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-bold">{totalPomodoros}</span>
              </div>
            </div>
          </div>

          {/* Session Dots (only for pomodoro mode) */}
          {timerMode === "pomodoro" && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    i < completedSessions % settings.sessionsBeforeLongBreak ? "bg-primary" : "bg-muted",
                  )}
                  initial={i === (completedSessions % settings.sessionsBeforeLongBreak) - 1 ? { scale: 0 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              ))}
            </div>
          )}

          {/* Flow mode message */}
          {timerMode === "flow" && state === "running" && (
            <motion.p
              className="text-center text-sm text-muted-foreground mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Deep focus mode - notifications paused
            </motion.p>
          )}
        </div>
      </motion.div>
    </>
  )
}
