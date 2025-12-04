"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useDrop } from "react-dnd"
import {
  Plus,
  X,
  Check,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  Repeat,
  GripVertical,
  ChevronDown,
  ChevronUp,
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
import { cn, formatDate, isToday } from "@/lib/utils"
import type { Task } from "@/lib/types"
import { TaskFormDialog } from "./task-form-dialog"

interface DayColumnProps {
  date: Date
  dayName: string
  tasks: Task[]
  onAddTask: (title: string, taskData?: Partial<Task>) => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onRemoveTask: (taskId: string) => void
  onMoveTask?: (taskId: string, fromDate: string, toDate: string) => void
}

export function DayColumn({ date, dayName, tasks, onAddTask, onUpdateTask, onRemoveTask, onMoveTask }: DayColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [showAdvancedForm, setShowAdvancedForm] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const isCurrentDay = isToday(date.toISOString())
  const isPast = date < new Date() && !isCurrentDay

  // Sort tasks: timed first (by time), then untimed
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime)
    if (a.startTime) return -1
    if (b.startTime) return 1
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return 0
  })

  // Drop zone for drag and drop
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "TASK",
      drop: (item: { id: string; task: Task; fromDate: string }) => {
        if (onMoveTask && item.fromDate !== date.toISOString()) {
          onMoveTask(item.id, item.fromDate, date.toISOString())
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [date, onMoveTask],
  )

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAdding])

  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingTaskId])

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim())
      setNewTaskTitle("")
    }
  }

  const handleAdvancedAdd = (taskData: Partial<Task>) => {
    onAddTask(taskData.title || "", taskData)
    setShowAdvancedForm(false)
  }

  const handleEditTask = (task: Task) => {
    if (editingTitle.trim() && editingTitle !== task.title) {
      onUpdateTask(task.id, { title: editingTitle.trim() })
    }
    setEditingTaskId(null)
    setEditingTitle("")
  }

  const toggleTaskComplete = (task: Task) => {
    onUpdateTask(task.id, {
      completed: !task.completed,
      status: task.completed ? "not-started" : "completed",
    })
  }

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id)
    setEditingTitle(task.title)
  }

  const getProgressColor = () => {
    if (progress >= 80) return "text-primary"
    if (progress >= 50) return "text-amber-500"
    if (progress > 0) return "text-orange-500"
    return "text-muted-foreground/30"
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-rose-500"
      case "medium":
        return "border-l-amber-500"
      case "low":
        return "border-l-blue-500"
      default:
        return "border-l-muted"
    }
  }

  // Drag handling for tasks
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        id: task.id,
        task,
        fromDate: date.toISOString(),
      }),
    )
    setDraggedTaskId(task.id)
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"))
      if (onMoveTask && data.fromDate !== date.toISOString()) {
        onMoveTask(data.id, data.fromDate, date.toISOString())
      }
    } catch (err) {
      // Invalid drop data
    }
  }

  return (
    <div
      ref={drop}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "bg-card rounded-xl border overflow-hidden flex flex-col transition-all",
        isCurrentDay && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg",
        isPast && !isCurrentDay && "opacity-75",
        isOver && canDrop && "ring-2 ring-primary/50 bg-primary/5",
      )}
    >
      {/* Header */}
      <div className={cn("p-3 border-b transition-colors", isCurrentDay ? "bg-primary/10" : "bg-muted/30")}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-bold", isCurrentDay ? "text-primary" : "text-foreground")}>
              {dayName}
            </span>
            {isCurrentDay && (
              <span className="text-[10px] font-medium bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                TODAY
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{formatDate(date)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 lg:hidden"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Progress Circle */}
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-muted/50"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={`${progress * 0.88} 100`}
                strokeLinecap="round"
                className={cn("transition-all duration-500", getProgressColor())}
              />
            </svg>
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center text-sm font-bold",
                progress >= 80 ? "text-primary" : "",
              )}
            >
              {progress}%
            </span>
          </div>
          <div className="flex-1 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Done</span>
              <span className="font-semibold text-primary">{completedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Left</span>
              <span className="font-semibold">{totalCount - completedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {!isCollapsed && (
        <div className="flex-1 p-2 space-y-2 min-h-[180px] max-h-[350px] overflow-y-auto">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-start gap-2 p-3 rounded-lg border-l-2 group transition-all cursor-grab active:cursor-grabbing",
                getPriorityColor(task.priority),
                task.completed ? "bg-primary/5 hover:bg-primary/10" : "bg-muted/30 hover:bg-muted/50",
                draggedTaskId === task.id && "opacity-50",
              )}
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
              </div>

              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTaskComplete(task)}
                className={cn(
                  "mt-0.5 rounded-sm transition-all shrink-0",
                  task.completed && "bg-primary border-primary data-[state=checked]:bg-primary",
                )}
              />

              {editingTaskId === task.id ? (
                <Input
                  ref={editInputRef}
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleEditTask(task)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditTask(task)
                    if (e.key === "Escape") {
                      setEditingTaskId(null)
                      setEditingTitle("")
                    }
                  }}
                  className="flex-1 h-6 text-sm py-0 px-1"
                />
              ) : (
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      "text-sm leading-relaxed cursor-pointer block break-words",
                      task.completed && "line-through text-muted-foreground",
                    )}
                    onDoubleClick={() => startEditing(task)}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {task.startTime && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {task.startTime}
                        {task.endTime && `-${task.endTime}`}
                      </span>
                    )}
                    {task.recurring && (
                      <span className="text-[10px] text-primary/70 flex items-center gap-0.5">
                        <Repeat className="w-2.5 h-2.5" />
                        {task.recurring.type}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted rounded transition-opacity">
                    <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem onClick={() => startEditing(task)}>
                    <Pencil className="w-3.5 h-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      onUpdateTask(task.id, {
                        priority: task.priority === "high" ? "medium" : "high",
                      })
                    }
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full mr-2",
                        task.priority === "high" ? "bg-amber-500" : "bg-rose-500",
                      )}
                    />
                    {task.priority === "high" ? "Normal Priority" : "High Priority"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onRemoveTask(task.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {tasks.length === 0 && !isAdding && (
            <div className="flex flex-col items-center justify-center text-center py-8 px-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No tasks yet</p>
              <p className="text-xs text-muted-foreground/70">Click below to add one</p>
            </div>
          )}
        </div>
      )}

      {/* Add Task */}
      {!isCollapsed && (
        <div className="p-2 border-t bg-muted/20">
          {isAdding ? (
            <div className="flex gap-1.5">
              <Input
                ref={inputRef}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task name..."
                className="flex-1 h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTask()
                  if (e.key === "Escape") {
                    setIsAdding(false)
                    setNewTaskTitle("")
                  }
                }}
              />
              <Button onClick={handleAddTask} size="sm" className="h-8 w-8 p-0">
                <Check className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false)
                  setNewTaskTitle("")
                }}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-1">
              <Button
                onClick={() => setIsAdding(true)}
                variant="ghost"
                size="sm"
                className="flex-1 text-muted-foreground hover:text-primary justify-center h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                Quick Add
              </Button>
              <Button
                onClick={() => setShowAdvancedForm(true)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <TaskFormDialog open={showAdvancedForm} onOpenChange={setShowAdvancedForm} onSubmit={handleAdvancedAdd} />
    </div>
  )
}
