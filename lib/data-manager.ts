"use client"

import type { Habit, Task, PomodoroSettings, Achievement } from "./types"

interface ExportData {
  version: string
  exportedAt: string
  habits?: Habit[]
  tasks?: Record<string, Record<string, Task[]>>
  settings?: PomodoroSettings
  quotes?: Record<string, string>
  achievements?: Achievement[]
}

interface ExportOptions {
  habits: boolean
  tasks: boolean
  settings: boolean
  quotes: boolean
  achievements: boolean
}

const STORAGE_KEYS = {
  habits: "focuslab-habits",
  tasks: "focuslab-all-week-tasks",
  settings: "focuslab-pomodoro-settings",
  quotes: "focuslab-quotes",
  achievements: "focuslab-achievements",
}

export function exportData(options: ExportOptions): string {
  const data: ExportData = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
  }

  if (options.habits) {
    const habits = localStorage.getItem(STORAGE_KEYS.habits)
    if (habits) data.habits = JSON.parse(habits)
  }

  if (options.tasks) {
    const tasks = localStorage.getItem(STORAGE_KEYS.tasks)
    if (tasks) data.tasks = JSON.parse(tasks)
  }

  if (options.settings) {
    const settings = localStorage.getItem(STORAGE_KEYS.settings)
    if (settings) data.settings = JSON.parse(settings)
  }

  if (options.quotes) {
    const quotes = localStorage.getItem(STORAGE_KEYS.quotes)
    if (quotes) data.quotes = JSON.parse(quotes)
  }

  if (options.achievements) {
    const achievements = localStorage.getItem(STORAGE_KEYS.achievements)
    if (achievements) data.achievements = JSON.parse(achievements)
  }

  return JSON.stringify(data, null, 2)
}

export function importData(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString) as ExportData

    if (!data.version) {
      return { success: false, message: "Invalid backup file format" }
    }

    let importedCount = 0

    if (data.habits) {
      localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(data.habits))
      importedCount++
    }

    if (data.tasks) {
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(data.tasks))
      importedCount++
    }

    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data.settings))
      importedCount++
    }

    if (data.quotes) {
      localStorage.setItem(STORAGE_KEYS.quotes, JSON.stringify(data.quotes))
      importedCount++
    }

    if (data.achievements) {
      localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(data.achievements))
      importedCount++
    }

    // Trigger storage event to notify other components
    window.dispatchEvent(new Event("storage"))

    return {
      success: true,
      message: `Successfully imported ${importedCount} data categories. Refresh to see changes.`,
    }
  } catch (error) {
    return { success: false, message: "Failed to parse backup file" }
  }
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
  window.dispatchEvent(new Event("storage"))
  window.location.reload()
}
