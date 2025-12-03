"use client"

import { useState } from "react"
import { useDrag } from "react-dnd"
import { MoreHorizontal, Pencil, Trash2, Clock, Repeat, GripVertical } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"

interface DraggableTaskProps {
  task: Task
  onToggleComplete: () => void
  onEdit: (updates: Partial<Task>) => void
  onDelete: () => void
}

export function DraggableTask({ task, onToggleComplete, onEdit, onDelete }: DraggableTaskProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "TASK",
      item: { id: task.id, task },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [task],
  )

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onEdit({ title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  const getPriorityColor = () => {
    switch (task.priority) {
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

  return (
    <div
      ref={preview}
      className={cn(
        "flex items-start gap-2 p-2 rounded-lg border-l-2 group transition-all",
        getPriorityColor(),
        task.completed ? "bg-primary/5 hover:bg-primary/10" : "bg-muted/30 hover:bg-muted/50",
        isDragging && "opacity-50 ring-2 ring-primary",
      )}
    >
      <div ref={drag} className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
      </div>

      <Checkbox
        checked={task.completed}
        onCheckedChange={onToggleComplete}
        className={cn(
          "mt-0.5 rounded-sm transition-all",
          task.completed && "bg-primary border-primary data-[state=checked]:bg-primary",
        )}
      />

      {isEditing ? (
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveEdit()
            if (e.key === "Escape") {
              setIsEditing(false)
              setEditTitle(task.title)
            }
          }}
          className="flex-1 h-6 text-sm py-0 px-1"
          autoFocus
        />
      ) : (
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "text-sm leading-tight cursor-pointer block truncate",
              task.completed && "line-through text-muted-foreground",
            )}
            onDoubleClick={() => setIsEditing(true)}
          >
            {task.title}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            {task.startTime && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {task.startTime}
                {task.endTime && ` - ${task.endTime}`}
              </span>
            )}
            {task.recurring && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
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
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <Pencil className="w-3.5 h-3.5 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
