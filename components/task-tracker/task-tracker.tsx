"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Plus, ListTodo, Calendar, AlertTriangle, CheckCircle2, Clock, Filter, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskTable } from "./task-table"
import { AddTaskModal } from "./add-task-modal"
import type { Task } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { isOverdue, isToday, generateId } from "@/lib/utils"

type FilterStatus = "all" | "completed" | "not-completed" | "overdue"
type FilterPriority = "all" | "high" | "medium" | "low" | "optional"

export function TaskTracker() {
  const [tasks, setTasks, isLoaded] = useLocalStorage<Task[]>("focuslab-tasks", [])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all")

  const stats = useMemo(() => {
    const today = tasks.filter((t) => isToday(t.dueDate))
    const overdue = tasks.filter((t) => !t.completed && isOverdue(t.dueDate))
    const notCompleted = tasks.filter((t) => !t.completed)
    const completed = tasks.filter((t) => t.completed)
    const inProgress = tasks.filter((t) => t.status === "in-progress")
    const progress = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0

    return {
      today: today.length,
      total: tasks.length,
      overdue: overdue.length,
      notCompleted: notCompleted.length,
      completed: completed.length,
      inProgress: inProgress.length,
      progress,
    }
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Status filter
      if (filterStatus === "completed" && !task.completed) return false
      if (filterStatus === "not-completed" && task.completed) return false
      if (filterStatus === "overdue" && (task.completed || !isOverdue(task.dueDate))) return false

      // Priority filter
      if (filterPriority !== "all" && task.priority !== filterPriority) return false

      return true
    })
  }, [tasks, searchQuery, filterStatus, filterPriority])

  const hasActiveFilters = searchQuery || filterStatus !== "all" || filterPriority !== "all"

  const clearFilters = () => {
    setSearchQuery("")
    setFilterStatus("all")
    setFilterPriority("all")
  }

  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
            ...t,
            ...updates,
            completedAt: updates.completed ? new Date().toISOString() : undefined,
          }
          : t,
      ),
    )
  }

  const removeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  const reorderTasks = (newTasks: Task[]) => {
    setTasks(newTasks)
  }

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed))
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-12 bg-muted rounded-lg w-64 animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-14 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ListTodo className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-tight">Task List</h1>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Today"
            value={stats.today}
            color="text-blue-500"
            bgColor="bg-blue-500/10"
          />
          <StatCard
            icon={<ListTodo className="w-5 h-5" />}
            label="Total Tasks"
            value={stats.total}
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5" />}
            label="Overdue"
            value={stats.overdue}
            color="text-destructive"
            bgColor="bg-destructive/10"
            highlight={stats.overdue > 0}
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Completed"
            value={stats.completed}
            color="text-primary"
            bgColor="bg-primary/10"
          />
        </div>

        {/* Progress Bar */}
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <div className="flex items-center gap-4">
              {stats.completed > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCompleted}
                  className="h-7 text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear completed
                </Button>
              )}
              <span className="text-sm font-bold text-primary">{stats.progress}%</span>
            </div>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{stats.completed} completed</span>
            <span>{stats.notCompleted} remaining</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={(v: FilterStatus) => setFilterStatus(v)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-completed">Not Completed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={(v: FilterPriority) => setFilterPriority(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="optional">Optional</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Task Table */}
        <TaskTable
          tasks={filteredTasks}
          onUpdateTask={updateTask}
          onRemoveTask={removeTask}
          onReorderTasks={reorderTasks}
          totalCount={tasks.length}
          filteredCount={filteredTasks.length}
        />
      </main>

      <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={addTask} />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
  bgColor,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
  bgColor: string
  highlight?: boolean
}) {
  return (
    <div className={`bg-card rounded-xl border p-4 transition-all ${highlight ? "ring-2 ring-destructive/50" : ""}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center ${color}`}>{icon}</div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  )
}
