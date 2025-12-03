"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Repeat, Flag, Tag } from "lucide-react"
import type { Task } from "@/lib/types"
import { CATEGORIES } from "@/lib/types"

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: Partial<Task>) => void
  initialData?: Partial<Task>
  mode?: "create" | "edit"
}

export function TaskFormDialog({ open, onOpenChange, onSubmit, initialData, mode = "create" }: TaskFormDialogProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [priority, setPriority] = useState<Task["priority"]>(initialData?.priority || "medium")
  const [category, setCategory] = useState(initialData?.category || "Work")
  const [startTime, setStartTime] = useState(initialData?.startTime || "")
  const [endTime, setEndTime] = useState(initialData?.endTime || "")
  const [isRecurring, setIsRecurring] = useState(!!initialData?.recurring)
  const [recurringType, setRecurringType] = useState<"daily" | "weekly" | "weekdays" | "weekends">(
    initialData?.recurring?.type || "daily",
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const taskData: Partial<Task> = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      recurring: isRecurring ? { type: recurringType } : undefined,
    }

    onSubmit(taskData)
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setPriority("medium")
    setCategory("Work")
    setStartTime("")
    setEndTime("")
    setIsRecurring(false)
    setRecurringType("daily")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Task" : "Edit Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5" />
                Priority
              </Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Task["priority"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.emoji} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Time (optional)
            </Label>
            <div className="flex items-center gap-2">
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="flex-1" />
              <span className="text-muted-foreground">to</span>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="flex-1" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="recurring" className="cursor-pointer">
                Recurring Task
              </Label>
            </div>
            <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <Label>Repeat</Label>
              <Select value={recurringType} onValueChange={(v) => setRecurringType(v as typeof recurringType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Every Day</SelectItem>
                  <SelectItem value="weekdays">Weekdays (Mon-Fri)</SelectItem>
                  <SelectItem value="weekends">Weekends (Sat-Sun)</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {mode === "create" ? "Add Task" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
