"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Target, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useLocalStorage } from "@/hooks/use-local-storage"

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
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Target className="w-8 h-8" />
                        Focus Session Tracker
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track deep work sessions and maintain flow
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Current Session */}
                    <Card className="lg:col-span-2 p-8">
                        {!currentSession ? (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">Start New Session</h2>
                                <Input
                                    placeholder="What will you focus on?"
                                    value={taskName}
                                    onChange={(e) => setTaskName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && startSession()}
                                />
                                <Button onClick={startSession} className="w-full" disabled={!taskName.trim()}>
                                    <Play className="w-5 h-5 mr-2" />
                                    Start Focus Session
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="text-sm text-muted-foreground mb-2">Focusing on</div>
                                    <h2 className="text-2xl font-bold">{currentSession.taskName}</h2>
                                </div>

                                <div className="space-y-4">
                                    <Textarea
                                        placeholder="Session notes (optional)..."
                                        value={sessionNotes}
                                        onChange={(e) => setSessionNotes(e.target.value)}
                                        rows={4}
                                    />

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Session Quality</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <button
                                                    key={rating}
                                                    onClick={() => setSessionQuality(rating)}
                                                    className={`w-12 h-12 rounded-full ${rating <= sessionQuality
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-muted"
                                                        }`}
                                                >
                                                    {rating}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={endSession} variant="destructive" className="w-full">
                                    <Pause className="w-5 h-5 mr-2" />
                                    End Session
                                </Button>
                            </div>
                        )}
                    </Card>

                    {/* Stats */}
                    <div className="space-y-4">
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4">Today</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-3xl font-bold text-primary">{todaySessions.length}</div>
                                    <div className="text-sm text-muted-foreground">Sessions</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary">
                                        {formatDuration(totalToday)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Time</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Session History */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Recent Sessions</h2>
                    <div className="grid gap-3">
                        {sessions.slice(0, 10).map((session) => (
                            <Card key={session.id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="font-medium">{session.taskName}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(session.startTime).toLocaleString()} • {formatDuration(session.duration)}
                                        </div>
                                        {session.notes && (
                                            <p className="text-sm mt-2 text-muted-foreground">{session.notes}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        {Array.from({ length: session.quality }).map((_, i) => (
                                            <div key={i} className="w-2 h-2 rounded-full bg-primary" />
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
