"use client"

import { useState, useMemo, useCallback } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DayColumn } from "./day-column"
import { WeeklyStats } from "./weekly-stats"
import { QuoteSection } from "./quote-section"
import { type Task, DAYS_OF_WEEK, MOTIVATIONAL_QUOTES } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { formatDate, getWeekDates, getStartOfWeek, generateId, formatDateISO, getRandomQuote } from "@/lib/utils"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

export function WeeklyPlanner() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getStartOfWeek(new Date()))

  const weekKey = formatDateISO(currentWeekStart)

  const [allWeekTasks, setAllWeekTasks, isLoaded] = useLocalStorage<Record<string, Record<string, Task[]>>>(
    "focuslab-all-week-tasks",
    {},
  )

  const [allQuotes, setAllQuotes] = useLocalStorage<Record<string, string>>("focuslab-quotes", {})

  const weekTasks = allWeekTasks[weekKey] || {}

  const quote = allQuotes[weekKey] || getRandomQuote(MOTIVATIONAL_QUOTES)

  const setQuote = useCallback(
    (newQuote: string) => {
      setAllQuotes((prev) => ({
        ...prev,
        [weekKey]: newQuote,
      }))
    },
    [weekKey, setAllQuotes],
  )

  const setWeekTasks = useCallback(
    (updater: Record<string, Task[]> | ((prev: Record<string, Task[]>) => Record<string, Task[]>)) => {
      setAllWeekTasks((prev) => {
        const currentWeekData = prev[weekKey] || {}
        const newWeekData = typeof updater === "function" ? updater(currentWeekData) : updater
        return {
          ...prev,
          [weekKey]: newWeekData,
        }
      })
    },
    [weekKey, setAllWeekTasks],
  )

  const weekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart])

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() - 7)
    setCurrentWeekStart(newStart)
  }

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() + 7)
    setCurrentWeekStart(newStart)
  }

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getStartOfWeek(new Date()))
  }

  const isCurrentWeek = useMemo(() => {
    const today = getStartOfWeek(new Date())
    return formatDateISO(today) === weekKey
  }, [weekKey])

  const addTask = (dayIndex: number, title: string, taskData?: Partial<Task>) => {
    const dateKey = formatDateISO(weekDates[dayIndex])
    const newTask: Task = {
      id: generateId(),
      title,
      completed: false,
      failed: false,
      dueDate: dateKey,
      priority: taskData?.priority || "medium",
      status: "not-started",
      category: taskData?.category || "Work",
      createdAt: new Date().toISOString(),
      pomodorosSpent: 0,
      estimatedPomodoros: 1,
      startTime: taskData?.startTime,
      endTime: taskData?.endTime,
      recurring: taskData?.recurring,
      description: taskData?.description,
    }

    setWeekTasks((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newTask],
    }))

    if (taskData?.recurring) {
      createRecurringInstances(newTask, dayIndex)
    }
  }

  const createRecurringInstances = (task: Task, startDayIndex: number) => {
    if (!task.recurring) return

    const { type } = task.recurring
    const daysToCreate: number[] = []

    switch (type) {
      case "daily":
        for (let i = startDayIndex + 1; i < 7; i++) daysToCreate.push(i)
        break
      case "weekdays":
        for (let i = startDayIndex + 1; i < 7; i++) {
          if (i >= 1 && i <= 5) daysToCreate.push(i) // Mon-Fri
        }
        break
      case "weekends":
        for (let i = startDayIndex + 1; i < 7; i++) {
          if (i === 0 || i === 6) daysToCreate.push(i) // Sun, Sat
        }
        break
      case "weekly":
        // Only on same day next week - handled elsewhere
        break
    }

    setWeekTasks((prev) => {
      const updates = { ...prev }
      daysToCreate.forEach((dayIdx) => {
        const dateKey = formatDateISO(weekDates[dayIdx])
        const recurringTask: Task = {
          ...task,
          id: generateId(),
          dueDate: dateKey,
          recurring: { ...task.recurring!, parentId: task.id },
        }
        updates[dateKey] = [...(updates[dateKey] || []), recurringTask]
      })
      return updates
    })
  }

  const updateTask = (dayIndex: number, taskId: string, updates: Partial<Task>) => {
    const dateKey = formatDateISO(weekDates[dayIndex])
    setWeekTasks((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).map((t) =>
        t.id === taskId
          ? {
            ...t,
            ...updates,
            completedAt: updates.completed ? new Date().toISOString() : undefined,
          }
          : t,
      ),
    }))
  }

  const removeTask = (dayIndex: number, taskId: string) => {
    const dateKey = formatDateISO(weekDates[dayIndex])
    setWeekTasks((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).filter((t) => t.id !== taskId),
    }))
  }

  const moveTask = useCallback(
    (taskId: string, fromDateISO: string, toDateISO: string) => {
      const fromDate = new Date(fromDateISO)
      const toDate = new Date(toDateISO)
      const fromKey = formatDateISO(fromDate)
      const toKey = formatDateISO(toDate)

      setWeekTasks((prev) => {
        const task = prev[fromKey]?.find((t) => t.id === taskId)
        if (!task) return prev

        const updatedTask = { ...task, dueDate: toKey }

        return {
          ...prev,
          [fromKey]: (prev[fromKey] || []).filter((t) => t.id !== taskId),
          [toKey]: [...(prev[toKey] || []), updatedTask],
        }
      })
    },
    [setWeekTasks],
  )

  const getDayTasks = (dayIndex: number): Task[] => {
    const dateKey = formatDateISO(weekDates[dayIndex])
    return weekTasks[dateKey] || []
  }

  // Calculate total stats for the header
  const weekStats = useMemo(() => {
    const allTasks = Object.values(weekTasks).flat()
    const completed = allTasks.filter((t) => t.completed).length
    const total = allTasks.length
    return { completed, total, progress: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }, [weekTasks])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-[1800px] mx-auto space-y-6">
          <div className="h-12 bg-muted rounded-lg w-64 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="h-32 bg-muted rounded-xl animate-pulse" />
            <div className="lg:col-span-2 h-32 bg-muted rounded-xl animate-pulse" />
          </div>
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
          <div className="grid grid-cols-7 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-96 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-14 z-40">
          <div className="max-w-[1800px] mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold leading-tight">Weekly Planner</h1>
                    <p className="text-xs text-muted-foreground">Week of {formatDate(currentWeekStart)}</p>
                  </div>
                </div>
                {weekStats.total > 0 && (
                  <>
                    <div className="h-8 w-px bg-border hidden sm:block" />
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
                      <span className="text-sm font-medium text-primary">{weekStats.progress}%</span>
                      <span className="text-xs text-muted-foreground">
                        ({weekStats.completed}/{weekStats.total} tasks)
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={goToPreviousWeek} className="h-8 w-8 bg-transparent">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant={isCurrentWeek ? "default" : "outline"}
                  size="sm"
                  onClick={goToCurrentWeek}
                  className="h-8"
                >
                  {isCurrentWeek ? "This Week" : "Today"}
                </Button>
                <Button variant="outline" size="icon" onClick={goToNextWeek} className="h-8 w-8 bg-transparent">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1800px] mx-auto p-4 space-y-6">
          {/* Quote and Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <QuoteSection quote={quote} onQuoteChange={setQuote} />
            <div className="lg:col-span-2">
              <WeeklyStats weekDates={weekDates} weekTasks={weekTasks} />
            </div>
          </div>

          {/* Day Columns with drag hint */}
          <div className="text-xs text-muted-foreground text-center mb-2">Drag tasks between days to reschedule</div>

          {/* Dynamic 2-row layout */}
          <div className="space-y-4">
            {(() => {
              // Find today's index in the week
              const todayIndex = weekDates.findIndex((date) => {
                const today = new Date()
                return date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear()
              })

              // If today is found in the current week
              if (todayIndex !== -1) {
                const yesterdayIndex = todayIndex - 1
                const tomorrowIndex = todayIndex + 1

                // First row: Yesterday, Today, Tomorrow (if they exist)
                const firstRowIndices: number[] = []
                if (yesterdayIndex >= 0) firstRowIndices.push(yesterdayIndex)
                firstRowIndices.push(todayIndex)
                if (tomorrowIndex < 7) firstRowIndices.push(tomorrowIndex)

                // Second row: All other days
                const secondRowIndices = weekDates
                  .map((_, index) => index)
                  .filter((index) => !firstRowIndices.includes(index))

                return (
                  <>
                    {/* First Row: Yesterday | Today | Tomorrow */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
                      {firstRowIndices.map((index) => (
                        <div key={index} className="w-full max-w-[400px]">
                          <DayColumn
                            date={weekDates[index]}
                            dayName={DAYS_OF_WEEK[index]}
                            tasks={getDayTasks(index)}
                            onAddTask={(title, taskData) => addTask(index, title, taskData)}
                            onUpdateTask={(taskId, updates) => updateTask(index, taskId, updates)}
                            onRemoveTask={(taskId) => removeTask(index, taskId)}
                            onMoveTask={moveTask}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Second Row: Remaining 4 days */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {secondRowIndices.map((index) => (
                        <DayColumn
                          key={index}
                          date={weekDates[index]}
                          dayName={DAYS_OF_WEEK[index]}
                          tasks={getDayTasks(index)}
                          onAddTask={(title, taskData) => addTask(index, title, taskData)}
                          onUpdateTask={(taskId, updates) => updateTask(index, taskId, updates)}
                          onRemoveTask={(taskId) => removeTask(index, taskId)}
                          onMoveTask={moveTask}
                        />
                      ))}
                    </div>
                  </>
                )
              } else {
                // Fallback: If today is not in the current week, show all 7 days in rows
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    {weekDates.map((date, index) => (
                      <DayColumn
                        key={date.toISOString()}
                        date={date}
                        dayName={DAYS_OF_WEEK[index]}
                        tasks={getDayTasks(index)}
                        onAddTask={(title, taskData) => addTask(index, title, taskData)}
                        onUpdateTask={(taskId, updates) => updateTask(index, taskId, updates)}
                        onRemoveTask={(taskId) => removeTask(index, taskId)}
                        onMoveTask={moveTask}
                      />
                    ))}
                  </div>
                )
              }
            })()}
          </div>
        </main>
      </div>
    </DndProvider>
  )
}
