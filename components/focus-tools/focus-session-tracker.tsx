"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Target, Plus, Check } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cn } from "@/lib/utils"

interface FocusSession {
    id: string
    taskName: string
    startTime: string
    endTime?: string
    duration: number // seconds
    notes?: string
    quality: number // 1-5
}

export function FocusSessionTracker() {
    const { resolvedTheme } = useTheme()
    const [sessions, setSessions] = useLocalStorage<FocusSession[]>("focus-sessions", [])
    const [currentSession, setCurrentSession] = useState<FocusSession | null>(null)
    const [taskName, setTaskName] = useState("")
    const [sessionNotes, setSessionNotes] = useState("")
    const [sessionQuality, setSessionQuality] = useState(3)

    // Start new session
    const startSession = () => {
        if (!taskName.trim()) return

        const session: FocusSession = {
            id: Date.now().toString(),
            taskName,
            startTime: new Date().toISOString(),
            duration: 0,
            quality: 3,
        }
        setCurrentSession(session)
        setTaskName("")
    }

    // End session
    const endSession = () => {
        if (!currentSession) return

        const endedSession: FocusSession = {
            ...currentSession,
            endTime: new Date().toISOString(),
            notes: sessionNotes,
            quality: sessionQuality,
        }

        setSessions([endedSession, ...sessions])
        setCurrentSession(null)
        setSessionNotes("")
        setSessionQuality(3)
    }

    // Format time
    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
    }

    const todaySessions = sessions.filter(s => {
        const sessionDate = new Date(s.startTime)
        const today = new Date()
        return sessionDate.toDateString() === today.toDateString()
    })

    const totalToday = todaySessions.reduce((sum, s) => sum + s.duration, 0)

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans p-6">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
                style={{
                    backgroundImage: resolvedTheme === "dark"
                        ? "url('/night-landscape.png')"
                        : "url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop')",
                }}
            >
                <div className={cn(
                    "absolute inset-0 transition-colors duration-1000",
                    resolvedTheme === "dark" ? "bg-black/40" : "bg-black/20"
                )} />
                <div className="absolute inset-0 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 max-w-6xl w-full space-y-8">
                <div className="text-center text-white">
                    <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
                        <Target className="w-8 h-8" />
                        Focus Session Tracker
                    </h1>
                    <p className="text-white/80 mt-1">
                        Track deep work sessions and maintain flow
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Current Session */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 rounded-[30px] bg-white/30 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-2xl p-8 text-slate-800 dark:text-white"
                    >
                        {!currentSession ? (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold">Start New Session</h2>
                                <Input
                                    placeholder="What will you focus on?"
                                    value={taskName}
                                    onChange={(e) => setTaskName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && startSession()}
                                    className="bg-white/50 dark:bg-black/20 border-white/20 h-12 text-lg placeholder:text-slate-500 dark:placeholder:text-white/50"
                                />
                                <Button
                                    onClick={startSession}
                                    className="w-full h-12 text-lg rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white/90"
                                    disabled={!taskName.trim()}
                                >
                                    <Play className="w-5 h-5 mr-2" />
                                    Start Focus Session
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <div className="text-sm font-medium uppercase tracking-wider opacity-70 mb-2">Focusing on</div>
                                    <h2 className="text-4xl font-bold">{currentSession.taskName}</h2>
                                </div>

                                <div className="space-y-6">
                                    <Textarea
                                        placeholder="Session notes (optional)..."
                                        value={sessionNotes}
                                        onChange={(e) => setSessionNotes(e.target.value)}
                                        rows={4}
                                        className="bg-white/50 dark:bg-black/20 border-white/20 resize-none text-base"
                                    />

                                    <div>
                                        <label className="text-sm font-medium mb-3 block opacity-80">Session Quality</label>
                                        <div className="flex gap-3 justify-center">
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <button
                                                    key={rating}
                                                    onClick={() => setSessionQuality(rating)}
                                                    className={cn(
                                                        "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300",
                                                        rating <= sessionQuality
                                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 scale-110 shadow-lg"
                                                            : "bg-white/20 dark:bg-white/10 hover:bg-white/40 dark:hover:bg-white/20"
                                                    )}
                                                >
                                                    {rating}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={endSession}
                                    variant="destructive"
                                    className="w-full h-12 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Pause className="w-5 h-5 mr-2" />
                                    End Session
                                </Button>
                            </div>
                        )}
                    </motion.div>

                    {/* Stats */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-[30px] bg-white/30 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-2xl p-6 text-slate-800 dark:text-white"
                        >
                            <h3 className="font-semibold mb-4 text-lg">Today's Progress</h3>
                            <div className="space-y-4">
                                <div className="bg-white/20 dark:bg-white/5 rounded-2xl p-4">
                                    <div className="text-4xl font-bold mb-1">{todaySessions.length}</div>
                                    <div className="text-sm opacity-70">Sessions Completed</div>
                                </div>
                                <div className="bg-white/20 dark:bg-white/5 rounded-2xl p-4">
                                    <div className="text-4xl font-bold mb-1">
                                        {formatDuration(totalToday)}
                                    </div>
                                    <div className="text-sm opacity-70">Total Focus Time</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Session History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <h2 className="text-xl font-semibold text-white pl-2">Recent Sessions</h2>
                    <div className="grid gap-4">
                        {sessions.slice(0, 5).map((session, i) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="rounded-2xl bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/20 p-5 text-slate-800 dark:text-white hover:bg-white/30 dark:hover:bg-black/40 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="font-bold text-lg mb-1">{session.taskName}</div>
                                        <div className="text-sm opacity-70 flex items-center gap-2">
                                            <span>{new Date(session.startTime).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span>•</span>
                                            <span className="font-medium bg-white/20 dark:bg-white/10 px-2 py-0.5 rounded-full text-xs">
                                                {formatDuration(session.duration)}
                                            </span>
                                        </div>
                                        {session.notes && (
                                            <p className="text-sm mt-3 opacity-80 bg-black/5 dark:bg-white/5 p-3 rounded-xl">
                                                {session.notes}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-1 ml-4">
                                        {Array.from({ length: session.quality }).map((_, i) => (
                                            <div key={i} className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white" />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
