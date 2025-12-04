"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay } from "date-fns"
import { useTheme } from "next-themes"
import { Card } from "@/components/ui/card"
import { Habit } from "@/lib/types"

interface HabitProgressGraphProps {
    habits: Habit[]
    view: "week" | "month"
    onViewChange: (view: "week" | "month") => void
    currentDate: Date
}

export function HabitProgressGraph({ habits, view, onViewChange, currentDate }: HabitProgressGraphProps) {
    const { resolvedTheme } = useTheme()

    const data = useMemo(() => {
        let start: Date
        let end: Date

        if (view === "week") {
            start = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday start
            end = endOfWeek(currentDate, { weekStartsOn: 1 })
        } else {
            start = startOfMonth(currentDate)
            end = endOfMonth(currentDate)
        }

        const days = eachDayOfInterval({ start, end })

        return days.map(day => {
            const dateStr = format(day, "yyyy-MM-dd")
            let completedCount = 0
            let totalHabits = habits.length

            if (totalHabits === 0) return { date: format(day, "d MMM"), percentage: 0 }

            habits.forEach(habit => {
                if (habit.completedDays[dateStr]) {
                    completedCount++
                }
            })

            return {
                date: format(day, "d MMM"),
                fullDate: dateStr,
                percentage: Math.round((completedCount / totalHabits) * 100)
            }
        })
    }, [habits, view, currentDate])

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-xl">
                    <p className="font-medium mb-1">{label}</p>
                    <p className="text-sm text-teal-600 dark:text-teal-400">
                        Completion: {payload[0].value}%
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-[300px] mt-8"
        >
            <Card className="w-full h-full p-6 bg-white/30 dark:bg-black/40 backdrop-blur-xl border-white/40 dark:border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Progress Overview</h3>
                    <div className="flex bg-slate-100 dark:bg-white/10 rounded-lg p-1">
                        <button
                            onClick={() => onViewChange("week")}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${view === "week"
                                ? "bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => onViewChange("month")}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${view === "month"
                                ? "bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                        >
                            Month
                        </button>
                    </div>
                </div>

                <div className="w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={resolvedTheme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: resolvedTheme === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", fontSize: 12 }}
                                dy={10}
                                interval={view === "month" ? 2 : 0}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: resolvedTheme === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", fontSize: 12 }}
                                domain={[0, 100]}
                                unit="%"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="percentage"
                                stroke="#2DD4BF"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorProgress)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </motion.div>
    )
}
