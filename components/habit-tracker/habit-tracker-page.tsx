"use client"

import { useState, useMemo } from "react"
import { Target, TrendingUp, Flame } from "lucide-react"
import { HabitTracker } from "./habit-tracker"
import { getWeekDates, getStartOfWeek } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function HabitTrackerPage() {
    const [currentWeekStart, setCurrentWeekStart] = useState(() => getStartOfWeek(new Date()))

    const weekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart])

    const goToPreviousWeek = () => {
        const newStart = new Date(currentWeekStart)
        newStart.setDate(newStart.getDate() - 7)
        setCurrentWeekStart(newStart)
    }

    const goToNextWeek = () => {
        const newStart = new Date(currentWeekStart)
        newStart.setDate(newStart.getDate() + 7)
        setCurrentWeekStart(newStart)
    }

    const goToCurrentWeek = () => {
        setCurrentWeekStart(getStartOfWeek(new Date()))
    }

    const isCurrentWeek = useMemo(() => {
        const today = getStartOfWeek(new Date())
        return today.getTime() === currentWeekStart.getTime()
    }, [currentWeekStart])

    const formatWeekRange = (startDate: Date) => {
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 6)

        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
        const start = startDate.toLocaleDateString('en-US', options)
        const end = endDate.toLocaleDateString('en-US', options)

        return `${start} - ${end}`
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-14 z-40">
                <div className="max-w-[1800px] mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                    <Target className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold leading-tight">Habit Tracker</h1>
                                    <p className="text-xs text-muted-foreground">{formatWeekRange(currentWeekStart)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={goToPreviousWeek} className="h-9 w-9 bg-transparent">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={isCurrentWeek ? "default" : "outline"}
                                size="sm"
                                onClick={goToCurrentWeek}
                                className="h-9"
                            >
                                {isCurrentWeek ? "This Week" : "Today"}
                            </Button>
                            <Button variant="outline" size="icon" onClick={goToNextWeek} className="h-9 w-9 bg-transparent">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1400px] mx-auto p-6">
                <HabitTracker weekDates={weekDates} />
            </main>
        </div>
    )
}
