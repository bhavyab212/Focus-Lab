"use client"

import { useState } from "react"
import { Trash2, Circle, CheckCircle2, AlertCircle, Clock, ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn, isOverdue, getRelativeDateLabel } from "@/lib/utils"
import { type Task, CATEGORIES } from "@/lib/types"

interface TaskTableProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onRemoveTask: (taskId: string) => void
  totalCount: number
  filteredCount: number
}

type SortField = "title" | "dueDate" | "priority" | "status"
type SortDirection = "asc" | "desc"

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2, optional: 3 }
const STATUS_ORDER = { "not-started": 0, "in-progress": 1, completed: 2 }

export function TaskTable({ tasks, onUpdateTask, onRemoveTask, totalCount, filteredCount }: TaskTableProps) {
  const [sortField, setSortField] = useState<SortField>("dueDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  const sortedTasks = [...tasks].sort((a, b) => {
    // Completed tasks always go to bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }

    let comparison = 0
    switch (sortField) {
      case "title":
        comparison = a.title.localeCompare(b.title)
        break
      case "dueDate":
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        break
      case "priority":
        comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        break
      case "status":
        comparison = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
        break
    }
    return sortDirection === "asc" ? comparison : -comparison
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const toggleComplete = (task: Task) => {
    onUpdateTask(task.id, {
      completed: !task.completed,
      status: task.completed ? "not-started" : "completed",
    })
  }

  const handleEditSave = (task: Task) => {
    if (editingTitle.trim() && editingTitle !== task.title) {
      onUpdateTask(task.id, { title: editingTitle.trim() })
    }
    setEditingId(null)
    setEditingTitle("")
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-500/10 border-red-200"
      case "medium":
        return "text-amber-600 bg-amber-500/10 border-amber-200"
      case "low":
        return "text-green-600 bg-green-500/10 border-green-200"
      case "optional":
        return "text-gray-500 bg-gray-500/10 border-gray-200"
    }
  }

  const getStatusIcon = (task: Task) => {
    if (task.completed) {
      return <CheckCircle2 className="w-4 h-4 text-primary" />
    }
    if (isOverdue(task.dueDate)) {
      return <AlertCircle className="w-4 h-4 text-destructive" />
    }
    if (task.status === "in-progress") {
      return <Clock className="w-4 h-4 text-amber-500" />
    }
    return <Circle className="w-4 h-4 text-muted-foreground" />
  }

  const getCategory = (categoryName: string) => {
    return (
      CATEGORIES.find((c) => c.name === categoryName) || {
        name: categoryName,
        emoji: "📌",
        color: "bg-gray-500",
      }
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{totalCount === 0 ? "No tasks yet" : "No matching tasks"}</h3>
        <p className="text-muted-foreground">
          {totalCount === 0
            ? "Add your first task to get started with tracking your progress."
            : `No tasks match your current filters. You have ${totalCount} total tasks.`}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      {filteredCount !== totalCount && (
        <div className="px-4 py-2 bg-muted/50 border-b text-sm text-muted-foreground">
          Showing {filteredCount} of {totalCount} tasks
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-12" />
              <TableHead className="min-w-[200px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("title")}
                  className="-ml-3 h-8 font-semibold"
                >
                  Task
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[120px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("dueDate")}
                  className="-ml-3 h-8 font-semibold"
                >
                  Due Date
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[100px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("priority")}
                  className="-ml-3 h-8 font-semibold"
                >
                  Priority
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[140px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("status")}
                  className="-ml-3 h-8 font-semibold"
                >
                  Status
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[120px]">Category</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => {
              const taskOverdue = !task.completed && isOverdue(task.dueDate)
              const category = getCategory(task.category)

              return (
                <TableRow
                  key={task.id}
                  className={cn(
                    "group transition-colors",
                    task.completed && "bg-muted/20",
                    taskOverdue && "bg-destructive/5",
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleComplete(task)}
                      className={cn(
                        "transition-all",
                        task.completed && "bg-primary border-primary data-[state=checked]:bg-primary",
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    {editingId === task.id ? (
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleEditSave(task)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave(task)
                          if (e.key === "Escape") {
                            setEditingId(null)
                            setEditingTitle("")
                          }
                        }}
                        className="h-7 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={cn(
                          "font-medium cursor-pointer",
                          task.completed && "line-through text-muted-foreground",
                        )}
                        onDoubleClick={() => {
                          setEditingId(task.id)
                          setEditingTitle(task.title)
                        }}
                      >
                        {task.title}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-sm", taskOverdue && "text-destructive font-medium")}>
                      {getRelativeDateLabel(task.dueDate)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.priority}
                      onValueChange={(value: Task["priority"]) => onUpdateTask(task.id, { priority: value })}
                    >
                      <SelectTrigger
                        className={cn("w-24 h-7 text-xs font-medium border", getPriorityColor(task.priority))}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task)}
                      <Select
                        value={task.status}
                        onValueChange={(value: Task["status"]) =>
                          onUpdateTask(task.id, {
                            status: value,
                            completed: value === "completed",
                          })
                        }
                      >
                        <SelectTrigger className="w-28 h-7 text-xs border-0 bg-muted/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-started">Not Started</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select value={task.category} onValueChange={(value) => onUpdateTask(task.id, { category: value })}>
                      <SelectTrigger className="w-28 h-7 text-xs border-0 bg-muted/50">
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{category.emoji}</span>
                          <span className="truncate">{category.name}</span>
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.name} value={cat.name}>
                            <span className="flex items-center gap-2">
                              <span>{cat.emoji}</span>
                              {cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingId(task.id)
                            setEditingTitle(task.title)
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5 mr-2" />
                          Edit
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
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
