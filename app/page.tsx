"use client"

import { useState, useEffect } from "react"
import { Calendar, ListTodo, Moon, Sun, Sparkles, Settings, Download, Upload, Timer, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { WeeklyPlanner } from "@/components/weekly-planner/weekly-planner"
import { HabitTrackerPage } from "@/components/habit-tracker/habit-tracker-page"
import { FocusToolsPage } from "@/components/focus-tools/focus-tools-page"
import { AnalyticsPage } from "@/components/analytics/analytics-page"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AchievementSystem } from "@/components/gamification/achievement-system"
import { exportData, importData } from "@/lib/data-manager"
import type { Habit } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

type View = "habits" | "tasks" | "focus" | "analytics"

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("habits")
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [habits] = useLocalStorage<Habit[]>("focuslab-habits", [])

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("focuslab-theme")
    if (savedTheme === "dark") {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration failed silently
      })
    }
  }, [])

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newValue = !prev
      if (newValue) {
        document.documentElement.classList.add("dark")
        localStorage.setItem("focuslab-theme", "dark")
      } else {
        document.documentElement.classList.remove("dark")
        localStorage.setItem("focuslab-theme", "light")
      }
      return newValue
    })
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20" />
          <div className="h-6 w-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">FocusLab</span>
                <span className="text-[10px] text-muted-foreground leading-none">Habit Tracker & Planner</span>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => setCurrentView("habits")}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                  currentView === "habits"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Habits</span>
              </button>
              <button
                onClick={() => setCurrentView("tasks")}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                  currentView === "tasks"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <ListTodo className="w-4 h-4" />
                <span className="hidden sm:inline">Tasks</span>
              </button>
              <button
                onClick={() => setCurrentView("focus")}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                  currentView === "focus"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Timer className="w-4 h-4" />
                <span className="hidden sm:inline">Focus</span>
              </button>
              <button
                onClick={() => setCurrentView("analytics")}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                  currentView === "analytics"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Achievement Badge */}
              <AchievementSystem habits={habits} />

              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg">
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={toggleTheme}>
                    {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                    {isDark ? "Light Mode" : "Dark Mode"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      const data = exportData({
                        habits: true,
                        tasks: true,
                        settings: true,
                        quotes: true,
                        achievements: true,
                      })
                      const blob = new Blob([data], { type: "application/json" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `focuslab-backup-${new Date().toISOString().split("T")[0]}.json`
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      URL.revokeObjectURL(url)
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = ".json"
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (e) => {
                            const result = importData(e.target?.result as string)
                            if (result.success) {
                              window.location.reload()
                            } else {
                              alert(result.message)
                            }
                          }
                          reader.readAsText(file)
                        }
                      }
                      input.click()
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentView === "habits" && <HabitTrackerPage />}
        {currentView === "tasks" && <WeeklyPlanner />}
        {currentView === "focus" && <FocusToolsPage />}
        {currentView === "analytics" && <AnalyticsPage />}
      </main>
    </div>
  )
}
