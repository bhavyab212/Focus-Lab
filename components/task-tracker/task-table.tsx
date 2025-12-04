"use client"

import { useState } from "react"
import { Trash2, Circle, CheckCircle2, AlertCircle, Clock, ArrowUpDown, MoreHorizontal, Pencil, XCircle, GripVertical } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn, isOverdue, getRelativeDateLabel } from "@/lib/utils"
import { type Task, CATEGORIES } from "@/lib/types"
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

interface TaskTableProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onRemoveTask: (taskId: string) => void
  onReorderTasks: (newTasks: Task[]) => void
  totalCount: number
  filteredCount: number
}

type SortField = "title" | "dueDate" | "priority" | "status"
type SortDirection = "asc" | "desc"

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2, optional: 3 }
const STATUS_ORDER = { "not-started": 0, "in-progress": 1, completed: 2, failed: 3 }

function SortableRow({
  task,
  children,
  className,
  ...props
}: {
  task: Task
  children: (listeners: any) => React.ReactNode
  className?: string
} & Omit<React.HTMLAttributes<HTMLTableRowElement>, "children">) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : "auto",
    position: "relative" as const,
  }

  return (
    <TableRow ref={setNodeRef} style={style} className={cn(className, isDragging && "bg-muted/50 shadow-lg")} {...attributes} {...props}>
      {children(listeners)}
    </TableRow>
  )
}

export function TaskTable({ tasks, onUpdateTask, onRemoveTask, onReorderTasks, totalCount, filteredCount }: TaskTableProps) {
  const [sortField, setSortField] = useState<SortField>("dueDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [failureDialogOpen, setFailureDialogOpen] = useState(false)
  const [selectedTaskForFailure, setSelectedTaskForFailure] = useState<Task | null>(null)
  const [failureReason, setFailureReason] = useState("")
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
      const oldIndex = tasks.findIndex((t) => t.id === active.id)
      const newIndex = tasks.findIndex((t) => t.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderTasks(arrayMove(tasks, oldIndex, newIndex))
      }
    }
    setActiveId(null)
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    // Failed and completed tasks go to bottom
    if (a.failed !== b.failed) {
      return a.failed ? 1 : -1
    }
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
      failed: false, // Clear failed status when completing
    })
  }

  const markAsFailed = (task: Task, reason: string) => {
    onUpdateTask(task.id, {
      failed: true,
      failedAt: new Date().toISOString(),
      failureReason: reason,
      status: "failed",
      completed: false,
    })
  }

  const handleFailureDialogOpen = (task: Task) => {
    setSelectedTaskForFailure(task)
    setFailureReason("")
    setFailureDialogOpen(true)
  }

  const handleFailureSubmit = () => {
    if (selectedTaskForFailure) {
      markAsFailed(selectedTaskForFailure, failureReason)
    }
    setFailureDialogOpen(false)
    setSelectedTaskForFailure(null)
    setFailureReason("")
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
    if (task.failed) {
      return <XCircle className="w-4 h-4 text-destructive" />
    }
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-12" /> {/* Drag Handle */}
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
              <SortableContext items={sortedTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                {sortedTasks.map((task) => {
                  const taskOverdue = !task.completed && isOverdue(task.dueDate)
                  const category = getCategory(task.category)

                  return (
                    <SortableRow
                      key={task.id}
                      task={task}
                      className={cn(
                        "group transition-colors",
                        task.completed && "bg-muted/20",
                        task.failed && "bg-destructive/10",
                        taskOverdue && !task.failed && "bg-destructive/5",
                      )}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        if (!task.completed && !task.failed) {
                          handleFailureDialogOpen(task)
                        }
                      }}
                    >
                      {(listeners) => (
                        <>
                          <TableCell>
                            <button {...listeners} className="cursor-grab hover:text-primary transition-colors p-1">
                              <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                            </button>
                          </TableCell>
                          <TableCell>
                            <div title="Right-click row to mark as failed">
                              <Checkbox
                                checked={task.completed}
                                onCheckedChange={() => toggleComplete(task)}
                                disabled={task.failed}
                                className={cn(
                                  "transition-all",
                                  task.completed && "bg-primary border-primary data-[state=checked]:bg-primary",
                                  task.failed && "opacity-50 cursor-not-allowed",
                                )}
                              />
                            </div>
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
                                  task.failed && "line-through text-destructive/70",
                                )}
                                onDoubleClick={() => {
                                  setEditingId(task.id)
                                  setEditingTitle(task.title)
                                }}
                              >
                                {task.title}
                                {task.failed && task.failureReason && (
                                  <span className="ml-2 text-xs text-destructive/60 italic">
                                    ({task.failureReason})
                                  </span>
                                )}
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
                                  <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={task.category}
                              onValueChange={(value) => onUpdateTask(task.id, { category: value })}
                            >
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                                >
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
                        </>
                      )}
                    </SortableRow>
                  )
                })}
              </SortableContext>
            </TableBody>
          </Table>
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="bg-background border rounded-md p-4 shadow-xl opacity-90 w-[300px] flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Moving task...</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Failure Dialog */}
      <Dialog open={failureDialogOpen} onOpenChange={setFailureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Task as Failed</DialogTitle>
            <DialogDescription>
              {selectedTaskForFailure?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="failure-reason">Reason for failure (optional)</Label>
              <Textarea
                id="failure-reason"
                placeholder="Why couldn't you complete this task?"
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFailureDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleFailureSubmit}>
              Mark as Failed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
