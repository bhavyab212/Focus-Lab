"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Flame,
  Target,
  TrendingUp,
  Sparkles,
  BarChart3,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, generateId, formatDateISO, isSameDay, calculateStreak } from "@/lib/utils"
import { type Habit, DAYS_OF_WEEK, DEFAULT_HABITS, HABIT_ICONS, HABIT_ICONS_CATEGORIZED } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Confetti } from "@/components/ui/confetti"
import { HabitAnalytics } from "./habit-analytics"
import { HabitProgressGraph } from "./habit-progress-graph"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface HabitTrackerProps {
  weekDates: Date[]
}

function SortableHabitItem({ id, children }: { id: string; children: (listeners: any) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : "auto",
    position: "relative" as const,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children(listeners)}
    </div>
  )
}

export function HabitTracker({ weekDates }: HabitTrackerProps) {
  const [graphView, setGraphView] = useState<"week" | "month">("week")
  const [habits, setHabits, isLoaded] = useLocalStorage<Habit[]>(
    "focuslab-habits",
    DEFAULT_HABITS.map((h) => ({
      id: generateId(),
      name: h.name,
      icon: h.icon,
      completedDays: {},
      failedDays: {},
      createdAt: new Date().toISOString(),
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
    })),
  )
  const [newHabit, setNewHabit] = useState("")
  const [newHabitIcon, setNewHabitIcon] = useState("🎯")
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedHabitForAnalytics, setSelectedHabitForAnalytics] = useState<Habit | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setHabits((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
    setActiveId(null)
  }

  // Auto-fail habits older than 1 day that aren't completed
  const autoFailOldHabits = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    setHabits((prev) =>
      prev.map((habit) => {
        const newFailedDays = { ...(habit.failedDays || {}) }
        let changed = false

        // Check each day in the past week
        for (let i = 1; i <= 7; i++) {
          const checkDate = new Date(today)
          checkDate.setDate(checkDate.getDate() - i)
          const dateKey = formatDateISO(checkDate)

          // If not completed and not already failed, mark as failed
          if (!habit.completedDays[dateKey] && !newFailedDays[dateKey]) {
            newFailedDays[dateKey] = true
            changed = true
          }
        }

        return changed ? { ...habit, failedDays: newFailedDays } : habit
      }),
    )
  }, [setHabits])

  // Run auto-fail check on mount and when habits change
  useEffect(() => {
    if (isLoaded) {
      autoFailOldHabits()
    }
  }, [isLoaded, autoFailOldHabits])

  const toggleHabitDay = useCallback(
    (habitId: string, date: Date) => {
      const dateKey = formatDateISO(date)

      setHabits((prev) =>
        prev.map((habit) => {
          if (habit.id !== habitId) return habit

          // Don't allow changes to failed days
          if (habit.failedDays?.[dateKey]) {
            return habit
          }

          // Check if this is editable (current day, yesterday, day before yesterday only)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const checkDate = new Date(date)
          checkDate.setHours(0, 0, 0, 0)
          const daysDiff = Math.floor((today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24))

          // Only allow editing if it's today (0), yesterday (1), or day before yesterday (2)
          // Block future days (negative) and days older than 2 days ago
          if (daysDiff < 0 || daysDiff > 2) {
            return habit
          }

          const newCompletedDays = {
            ...habit.completedDays,
            [dateKey]: !habit.completedDays[dateKey],
          }

          // If uncompleting, also remove from failed
          const newFailedDays = { ...habit.failedDays }
          if (!newCompletedDays[dateKey]) {
            delete newFailedDays[dateKey]
          }

          const isNowCompleted = newCompletedDays[dateKey]
          const streakInfo = calculateStreak(newCompletedDays)
          const totalCompletions = Object.values(newCompletedDays).filter(Boolean).length

          // Show confetti for streak milestones
          if (isNowCompleted && streakInfo.current > 0 && streakInfo.current % 7 === 0) {
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 3000)
          }

          return {
            ...habit,
            completedDays: newCompletedDays,
            failedDays: newFailedDays,
            currentStreak: streakInfo.current,
            longestStreak: Math.max(habit.longestStreak, streakInfo.longest),
            totalCompletions,
          }
        }),
      )
    },
    [setHabits],
  )

  const toggleFailedDay = useCallback(
    (habitId: string, date: Date) => {
      const dateKey = formatDateISO(date)

      setHabits((prev) =>
        prev.map((habit) => {
          if (habit.id !== habitId) return habit

          // Don't allow un-failing
          if (habit.failedDays?.[dateKey]) {
            return habit
          }

          const newFailedDays = {
            ...habit.failedDays,
            [dateKey]: true,
          }

          // Remove from completed if marking as failed
          const newCompletedDays = { ...habit.completedDays }
          delete newCompletedDays[dateKey]

          const streakInfo = calculateStreak(newCompletedDays)
          const totalCompletions = Object.values(newCompletedDays).filter(Boolean).length

          return {
            ...habit,
            completedDays: newCompletedDays,
            failedDays: newFailedDays,
            currentStreak: streakInfo.current,
            totalCompletions,
          }
        }),
      )
    },
    [setHabits],
  )

  const addHabit = useCallback(() => {
    if (newHabit.trim()) {
      setHabits((prev) => [
        ...prev,
        {
          id: generateId(),
          name: newHabit.trim(),
          icon: newHabitIcon,
          completedDays: {},
          failedDays: {},
          createdAt: new Date().toISOString(),
          currentStreak: 0,
          longestStreak: 0,
          totalCompletions: 0,
        },
      ])
      setNewHabit("")
      setNewHabitIcon("🎯")
      setIsAdding(false)
    }
  }, [newHabit, newHabitIcon, setHabits])

  const removeHabit = useCallback(
    (habitId: string) => {
      setHabits((prev) => prev.filter((h) => h.id !== habitId))
    },
    [setHabits],
  )

  const updateHabitName = useCallback(
    (habitId: string) => {
      if (editingName.trim()) {
        setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, name: editingName.trim() } : h)))
      }
      setEditingId(null)
      setEditingName("")
    },
    [editingName, setHabits],
  )

  const calculateProgress = useCallback(
    (habit: Habit): number => {
      const completed = weekDates.filter((date) => habit.completedDays[formatDateISO(date)]).length
      return Math.round((completed / 7) * 100)
    },
    [weekDates],
  )

  const calculateOverallProgress = useMemo((): number => {
    if (habits.length === 0) return 0
    const totalPossible = habits.length * 7
    const totalCompleted = habits.reduce((acc, habit) => {
      return acc + weekDates.filter((date) => habit.completedDays[formatDateISO(date)]).length
    }, 0)
    return Math.round((totalCompleted / totalPossible) * 100)
  }, [habits, weekDates])

  const todayIndex = useMemo(() => weekDates.findIndex((date) => isSameDay(date, new Date())), [weekDates])

  const totalActiveStreaks = useMemo(() => {
    return habits.filter((h) => h.currentStreak > 0).length
  }, [habits])

  const bestStreak = useMemo(() => {
    return Math.max(...habits.map((h) => h.currentStreak), 0)
  }, [habits])

  if (!isLoaded) {
    return (
      <div className="bg-card rounded-2xl border p-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <Confetti isActive={showConfetti} />

      <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
        <motion.div
          className="bg-card rounded-2xl border overflow-hidden shadow-sm card-hover"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Header */}
          <CollapsibleTrigger asChild>
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-4 border-b flex items-center justify-between cursor-pointer hover:from-primary/15 transition-all">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  {totalActiveStreaks > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Flame className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    Habit Tracker
                    <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {habits.length} habits
                    </span>
                  </h2>
                  <div className="flex items-center gap-3 mt-0.5">
                    {bestStreak > 0 && (
                      <span className="text-xs text-orange-500 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {bestStreak} day streak
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Quick Stats */}
                <div className="hidden sm:flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/50">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-primary">{calculateOverallProgress}%</span>
                  </div>
                </div>

                <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8" onClick={(e) => e.stopPropagation()}>
                      <BarChart3 className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Analytics</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Habit Analytics</DialogTitle>
                      <DialogDescription>Track your progress and identify patterns</DialogDescription>
                    </DialogHeader>
                    <HabitAnalytics habits={habits} selectedHabit={selectedHabitForAnalytics} />
                  </DialogContent>
                </Dialog>

                {isCollapsed ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_repeat(7,minmax(36px,44px))_70px] gap-1 px-5 py-2.5 bg-muted/30 border-b text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Habit</span>
              </div>
              {DAYS_OF_WEEK.map((day, index) => (
                <div key={day} className={cn("text-center font-semibold", index === todayIndex && "text-primary")}>
                  {day}
                </div>
              ))}
              <div className="text-center">Progress</div>
            </div>

            {/* Habits Grid */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="divide-y max-h-[400px] overflow-y-auto">
                <SortableContext items={habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
                  <AnimatePresence>
                    {habits.map((habit, habitIndex) => {
                      const progress = calculateProgress(habit)
                      const hasStreak = habit.currentStreak > 0

                      return (
                        <SortableHabitItem key={habit.id} id={habit.id}>
                          {(listeners) => (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.3, delay: habitIndex * 0.05 }}
                              className="grid grid-cols-[1fr_repeat(7,minmax(36px,44px))_70px] gap-1 px-5 py-3 items-center group hover:bg-muted/20 transition-colors"
                            >
                              {/* Habit Name */}
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  {...listeners}
                                  className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1 hover:bg-muted rounded touch-none"
                                >
                                  <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                                </div>
                                {habit.icon && <span className="text-base shrink-0">{habit.icon}</span>}
                                {editingId === habit.id ? (
                                  <Input
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onBlur={() => updateHabitName(habit.id)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") updateHabitName(habit.id)
                                      if (e.key === "Escape") {
                                        setEditingId(null)
                                        setEditingName("")
                                      }
                                    }}
                                    className="h-7 text-sm py-0 px-2"
                                    autoFocus
                                  />
                                ) : (
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-sm font-medium truncate">{habit.name}</span>
                                    {hasStreak && (
                                      <motion.span
                                        className="flex items-center gap-0.5 text-xs text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-full shrink-0"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                      >
                                        <Flame className="w-3 h-3" />
                                        {habit.currentStreak}
                                      </motion.span>
                                    )}
                                  </div>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity shrink-0">
                                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start" className="w-40">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedHabitForAnalytics(habit)
                                        setShowAnalytics(true)
                                      }}
                                    >
                                      <BarChart3 className="w-4 h-4 mr-2" />
                                      View Stats
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditingId(habit.id)
                                        setEditingName(habit.name)
                                      }}
                                    >
                                      <Pencil className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => removeHabit(habit.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              {/* Day Checkboxes */}
                              {weekDates.map((date, dayIndex) => {
                                const dateKey = formatDateISO(date)
                                const isChecked = habit.completedDays[dateKey] || false
                                const isFailed = habit.failedDays?.[dateKey] || false
                                const isToday = dayIndex === todayIndex

                                // Calculate if this date is editable (current day and day before yesterday only)
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                const checkDate = new Date(date)
                                checkDate.setHours(0, 0, 0, 0)
                                const daysDiff = Math.floor((today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24))
                                // Only editable if: today (0), yesterday (1), or day before yesterday (2)
                                // NOT future days (negative daysDiff) or days older than 2 days ago
                                const isEditable = daysDiff >= 0 && daysDiff <= 2

                                return (
                                  <div key={dateKey} className="flex justify-center">
                                    <motion.div
                                      whileTap={{ scale: isEditable ? 0.9 : 1 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                      onContextMenu={(e) => {
                                        e.preventDefault()
                                        if (isEditable && !isFailed) {
                                          toggleFailedDay(habit.id, date)
                                        }
                                      }}
                                      title={
                                        !isEditable
                                          ? daysDiff < 0
                                            ? "Future day (cannot edit)"
                                            : "Locked (too old to edit)"
                                          : isFailed
                                            ? "Failed (locked)"
                                            : isChecked
                                              ? "Completed - Right click to fail"
                                              : "Not completed - Click to complete, right click to fail"
                                      }
                                    >
                                      <div className="relative">
                                        <Checkbox
                                          checked={isChecked || isFailed}
                                          onCheckedChange={() => isEditable && toggleHabitDay(habit.id, date)}
                                          disabled={!isEditable || isFailed}
                                          className={cn(
                                            "w-6 h-6 rounded-md border-2 transition-all duration-200",
                                            !isEditable
                                              ? "cursor-not-allowed opacity-50 bg-muted border-muted"
                                              : isFailed
                                                ? "bg-rose-700 border-rose-700 data-[state=checked]:bg-rose-700 cursor-not-allowed shadow-md"
                                                : isChecked
                                                  ? "bg-lime-600 border-lime-600 data-[state=checked]:bg-lime-600 shadow-md"
                                                  : isToday
                                                    ? "border-primary/50 hover:border-primary hover:bg-primary/5"
                                                    : "border-muted-foreground/20 hover:border-primary/30 hover:bg-muted/50",
                                          )}
                                        />
                                        {isFailed && (
                                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <svg className="w-3.5 h-3.5 stroke-2" viewBox="0 0 16 16" fill="none">
                                              <path
                                                d="M2 2L14 14M14 2L2 14"
                                                stroke="white"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                              />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  </div>
                                )
                              })}

                              {/* Progress */}
                              <div className="text-center">
                                <motion.span
                                  className={cn(
                                    "text-xs font-bold px-2.5 py-1 rounded-full inline-block min-w-[48px]",
                                    progress >= 70
                                      ? "bg-primary/15 text-primary"
                                      : progress >= 40
                                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                        : progress > 0
                                          ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                                          : "bg-muted text-muted-foreground",
                                  )}
                                  key={progress}
                                  initial={{ scale: 1.2 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                  {progress}%
                                </motion.span>
                              </div>
                            </motion.div>
                          )}
                        </SortableHabitItem>
                      )
                    })}
                  </AnimatePresence>
                </SortableContext>
              </div>
              <DragOverlay>
                {activeId ? (
                  <div className="bg-background border rounded-md p-4 shadow-xl opacity-90 w-[300px] flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Moving habit...</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Add Habit */}
            <div className="p-4 border-t bg-muted/10">
              {isAdding ? (
                <motion.div
                  className="flex gap-2 items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 w-12 text-lg bg-transparent">
                        {newHabitIcon}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start" side="top" sideOffset={8}>
                      <div className="p-3 border-b bg-muted/30">
                        <h4 className="font-semibold text-sm">Choose an Icon</h4>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {Object.entries(HABIT_ICONS_CATEGORIZED).map(([category, icons]) => (
                          <div key={category} className="p-3 border-b last:border-b-0">
                            <h5 className="text-xs font-medium text-muted-foreground mb-2">{category}</h5>
                            <div className="grid grid-cols-8 gap-1">
                              {icons.map((icon) => (
                                <button
                                  key={icon}
                                  onClick={() => setNewHabitIcon(icon)}
                                  className={cn(
                                    "w-8 h-8 text-lg rounded-md hover:bg-muted transition-colors flex items-center justify-center",
                                    newHabitIcon === icon && "bg-primary/10 ring-2 ring-primary",
                                  )}
                                  title={icon}
                                >
                                  {icon}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    placeholder="What habit do you want to build?"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addHabit()
                      if (e.key === "Escape") {
                        setIsAdding(false)
                        setNewHabit("")
                      }
                    }}
                    autoFocus
                  />
                  <Button onClick={addHabit} size="sm" className="h-9">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAdding(false)
                      setNewHabit("")
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-9"
                  >
                    Cancel
                  </Button>
                </motion.div>
              ) : (
                <Button
                  onClick={() => setIsAdding(true)}
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary w-full justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Habit
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </motion.div>
      </Collapsible>

      <HabitProgressGraph
        habits={habits}
        view={graphView}
        onViewChange={setGraphView}
        currentDate={weekDates[0] || new Date()}
      />
    </>
  )
}
