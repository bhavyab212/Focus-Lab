import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    dates.push(date)
  }
  return dates
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`
}

export function isOverdue(dueDate: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return due < today
}

export function isToday(dateStr: string): boolean {
  const today = new Date()
  const date = new Date(dateStr)
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

export function getDaysUntilDue(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getRelativeDateLabel(dueDate: string): string {
  const days = getDaysUntilDue(dueDate)
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  if (days <= 7) return `In ${days} days`
  return formatDateDisplay(dueDate)
}

export function getRandomQuote(quotes: string[]): string {
  return quotes[Math.floor(Math.random() * quotes.length)]
}

export function calculateStreak(completedDays: Record<string, boolean>): { current: number; longest: number } {
  const sortedDates = Object.entries(completedDays)
    .filter(([_, completed]) => completed)
    .map(([date]) => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime())

  if (sortedDates.length === 0) return { current: 0, longest: 0 }

  let current = 0
  let longest = 0
  let tempStreak = 1

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Check if streak is still active (completed today or yesterday)
  const latestDate = sortedDates[0]
  latestDate.setHours(0, 0, 0, 0)

  const isActive = isSameDay(latestDate, today) || isSameDay(latestDate, yesterday)

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDate = sortedDates[i]
    const nextDate = sortedDates[i + 1]

    const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      tempStreak++
    } else {
      longest = Math.max(longest, tempStreak)
      if (i === 0 && isActive) {
        current = tempStreak
      }
      tempStreak = 1
    }
  }

  longest = Math.max(longest, tempStreak)
  if (isActive && current === 0) {
    current = tempStreak
  }

  return { current, longest }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function getDayProgress(): number {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  const total = endOfDay.getTime() - startOfDay.getTime()
  const elapsed = now.getTime() - startOfDay.getTime()

  return Math.round((elapsed / total) * 100)
}

export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function getDailyQuoteIndex(totalQuotes: number): number {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  return Math.floor(seededRandom(seed) * totalQuotes)
}
