"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Timer, Zap, Clock, Coffee, Target } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { PomodoroTimer } from "./pomodoro-timer"
import { FlowmodoroTimer } from "./flowmodoro-timer"
import { FocusSessionTracker } from "./focus-session-tracker"
import { BreakReminder } from "./break-reminder"

export function FocusToolsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Tabs defaultValue="pomodoro" className="w-full">
                <div className="border-b bg-card/50 backdrop-blur-sm sticky top-14 z-40">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <TabsList className="grid w-full max-w-2xl grid-cols-4 mx-auto">
                            <TabsTrigger value="pomodoro" className="flex gap-2">
                                <Timer className="w-4 h-4" />
                                <span className="hidden sm:inline">Pomodoro</span>
                            </TabsTrigger>
                            <TabsTrigger value="flowmodoro" className="flex gap-2">
                                <Zap className="w-4 h-4" />
                                <span className="hidden sm:inline">Flowmodoro</span>
                            </TabsTrigger>
                            <TabsTrigger value="sessions" className="flex gap-2">
                                <Target className="w-4 h-4" />
                                <span className="hidden sm:inline">Focus Sessions</span>
                            </TabsTrigger>
                            <TabsTrigger value="breaks" className="flex gap-2">
                                <Coffee className="w-4 h-4" />
                                <span className="hidden sm:inline">Breaks</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <TabsContent value="pomodoro" className="m-0">
                    <PomodoroTimer />
                </TabsContent>

                <TabsContent value="flowmodoro" className="m-0">
                    <FlowmodoroTimer />
                </TabsContent>

                <TabsContent value="sessions" className="m-0">
                    <FocusSessionTracker />
                </TabsContent>

                <TabsContent value="breaks" className="m-0">
                    <BreakReminder />
                </TabsContent>
            </Tabs>
        </div>
    )
}
