"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Target, Flame, Calendar as CalendarIcon, Download } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { AnalyticsCharts } from "./analytics-charts"
import type { Task, Habit } from "@/lib/types"

type TimeRange = "today" | "yesterday" | "day-before" | "this-week" | "last-week" | "this-month" | "last-month" | "full-year"

export function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState<TimeRange>("this-week")
    const [tasks] = useLocalStorage<Task[]>("focuslab-tasks", [])
    const [habits] = useLocalStorage<Habit[]>("focuslab-habits", [])

    // Calculate stats based on time range
    const getStats = () => {
        const now = new Date()
        let startDate: Date

        switch (timeRange) {
            case "today":
                startDate = new Date(now.setHours(0, 0, 0, 0))
                break
            case "yesterday":
                startDate = new Date(now.setDate(now.getDate() - 1))
                startDate.setHours(0, 0, 0, 0)
                break
            case "day-before":
                startDate = new Date(now.setDate(now.getDate() - 2))
                startDate.setHours(0, 0, 0, 0)
                break
            case "this-week":
                startDate = new Date(now.setDate(now.getDate() - now.getDay()))
                startDate.setHours(0, 0, 0, 0)
                break
            case "last-week":
                startDate = new Date(now.setDate(now.getDate() - now.getDay() - 7))
                startDate.setHours(0, 0, 0, 0)
                break
            case "this-month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                break
            case "last-month":
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                break
            case "full-year":
                startDate = new Date(now.getFullYear(), 0, 1)
                break
            default:
                startDate = new Date(0)
        }

        const completedTasks = tasks.filter(t =>
            t.completed && t.completedAt && new Date(t.completedAt) >= startDate
        ).length

        const failedTasks = tasks.filter(t =>
            t.failed && t.failedAt && new Date(t.failedAt) >= startDate
        ).length

        const inProgressTasks = tasks.filter(t =>
            !t.completed && !t.failed && t.status === "in-progress"
        ).length

        const totalTasks = tasks.length

        const completionRate = totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0

        return {
            completedTasks,
            failedTasks,
            inProgressTasks,
            totalTasks,
            completionRate,
            totalHabits: habits.length,
        }
    }

    const stats = getStats()

    // Export data function
    const exportData = () => {
        const data = {
            exportDate: new Date().toISOString(),
            timeRange,
            stats,
            tasks: tasks.map(t => ({
                id: t.id,
                title: t.title,
                status: t.status,
                priority: t.priority,
                category: t.category,
                completed: t.completed,
                failed: t.failed,
                dueDate: t.dueDate,
                createdAt: t.createdAt,
                completedAt: t.completedAt,
                failedAt: t.failedAt,
                failureReason: t.failureReason,
            })),
            habits: habits.map(h => ({
                id: h.id,
                name: h.name,
                icon: h.icon,
                color: h.color,
                frequency: h.frequency,
                streak: h.streak,
                completedDates: h.completedDates,
            })),
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `focuslab-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <BarChart3 className="w-8 h-8" />
                            Analytics Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Track your productivity and progress over time
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Export Button */}
                        <Button onClick={exportData} variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                        </Button>

                        {/* Time Range Selector */}
                        <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                            <SelectTrigger className="w-48">
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="yesterday">Yesterday</SelectItem>
                                <SelectItem value="day-before">Day Before Yesterday</SelectItem>
                                <SelectItem value="this-week">This Week</SelectItem>
                                <SelectItem value="last-week">Last Week</SelectItem>
                                <SelectItem value="this-month">This Month</SelectItem>
                                <SelectItem value="last-month">Last Month</SelectItem>
                                <SelectItem value="full-year">Full Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Target className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Completed Tasks</p>
                                <p className="text-2xl font-bold">{stats.completedTasks}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Failed Tasks</p>
                                <p className="text-2xl font-bold">{stats.failedTasks}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                                <CalendarIcon className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">In Progress</p>
                                <p className="text-2xl font-bold">{stats.inProgressTasks}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Flame className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Completion Rate</p>
                                <p className="text-2xl font-bold">{stats.completionRate}%</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Charts */}
                <AnalyticsCharts tasks={tasks} habits={habits} timeRange={timeRange} />

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
                        <h3 className="font-semibold mb-2">Total Tasks</h3>
                        <p className="text-3xl font-bold">{stats.totalTasks}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Across all statuses and categories
                        </p>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5">
                        <h3 className="font-semibold mb-2">Active Habits</h3>
                        <p className="text-3xl font-bold">{stats.totalHabits}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Currently being tracked
                        </p>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                        <h3 className="font-semibold mb-2">Success Rate</h3>
                        <p className="text-3xl font-bold">
                            {stats.completedTasks > 0
                                ? Math.round((stats.completedTasks / (stats.completedTasks + stats.failedTasks)) * 100)
                                : 0}%
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Completed vs failed tasks
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}
