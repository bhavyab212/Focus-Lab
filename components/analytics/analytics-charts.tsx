"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { Card } from "@/components/ui/card"
import type { Task, Habit } from "@/lib/types"

interface AnalyticsChartsProps {
    tasks: Task[]
    habits: Habit[]
    timeRange: string
}

const COLORS = {
    completed: "#22c55e",
    failed: "#ef4444",
    inProgress: "#f59e0b",
    notStarted: "#6b7280",
}

export function AnalyticsCharts({ tasks, habits, timeRange }: AnalyticsChartsProps) {
    // Task Distribution by Status
    const statusData = useMemo(() => {
        const completed = tasks.filter(t => t.completed).length
        const failed = tasks.filter(t => t.failed).length
        const inProgress = tasks.filter(t => !t.completed && !t.failed && t.status === "in-progress").length
        const notStarted = tasks.filter(t => !t.completed && !t.failed && t.status === "not-started").length

        return [
            { name: "Completed", value: completed, color: COLORS.completed },
            { name: "Failed", value: failed, color: COLORS.failed },
            { name: "In Progress", value: inProgress, color: COLORS.inProgress },
            { name: "Not Started", value: notStarted, color: COLORS.notStarted },
        ].filter(item => item.value > 0)
    }, [tasks])

    // Category Breakdown
    const categoryData = useMemo(() => {
        const categoryCount: Record<string, number> = {}
        tasks.forEach(task => {
            categoryCount[task.category] = (categoryCount[task.category] || 0) + 1
        })

        return Object.entries(categoryCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6) // Top 6 categories
    }, [tasks])

    // Success vs Failure Trend (last 7 days)
    const trendData = useMemo(() => {
        const days = []
        const now = new Date()

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(date.getDate() - i)
            date.setHours(0, 0, 0, 0)

            const nextDate = new Date(date)
            nextDate.setDate(nextDate.getDate() + 1)

            const completed = tasks.filter(t =>
                t.completed && t.completedAt &&
                new Date(t.completedAt) >= date &&
                new Date(t.completedAt) < nextDate
            ).length

            const failed = tasks.filter(t =>
                t.failed && t.failedAt &&
                new Date(t.failedAt) >= date &&
                new Date(t.failedAt) < nextDate
            ).length

            days.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                completed,
                failed,
            })
        }

        return days
    }, [tasks])

    // Priority Distribution
    const priorityData = useMemo(() => {
        const high = tasks.filter(t => t.priority === "high").length
        const medium = tasks.filter(t => t.priority === "medium").length
        const low = tasks.filter(t => t.priority === "low").length
        const optional = tasks.filter(t => t.priority === "optional").length

        return [
            { name: "High", value: high, color: "#ef4444" },
            { name: "Medium", value: medium, color: "#f59e0b" },
            { name: "Low", value: low, color: "#22c55e" },
            { name: "Optional", value: optional, color: "#6b7280" },
        ].filter(item => item.value > 0)
    }, [tasks])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Distribution */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </Card>

            {/* Category Breakdown */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="name"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                            }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Success vs Failure Trend */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">7-Day Completion Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="date"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="completed"
                            stroke={COLORS.completed}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Completed"
                        />
                        <Line
                            type="monotone"
                            dataKey="failed"
                            stroke={COLORS.failed}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Failed"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Priority Distribution */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={priorityData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {priorityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
        </div>
    )
}
