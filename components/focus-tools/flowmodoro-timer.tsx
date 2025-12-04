"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Play, Pause, RotateCcw, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/**
 * Flowmodoro Timer - Flexible Pomodoro
 * Work as long as you want, break time = work_time / 5
 */
export function FlowmodoroTimer() {
    const [isWorking, setIsWorking] = useState(false)
    const [workTime, setWorkTime] = useState(0) // in seconds
    const [breakTime, setBreakTime] = useState(0)
    const [isOnBreak, setIsOnBreak] = useState(false)
    const [flowLevel, setFlowLevel] = useState(0)

    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number>(0)

    // Format time to MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    // Start work session
    const startWork = () => {
        setIsWorking(true)
        setWorkTime(0)
        startTimeRef.current = Date.now()

        intervalRef.current = setInterval(() => {
            setWorkTime((prev) => prev + 1)

            // Update flow level based on time
            setFlowLevel((prev) => Math.min(100, prev + 0.5))
        }, 1000)
    }

    // Stop work and calculate break
    const stopWork = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        setIsWorking(false)
        const calculatedBreak = Math.floor(workTime / 5)
        setBreakTime(calculatedBreak)
        setIsOnBreak(true)
        setFlowLevel(0)

        // Start break timer
        let remainingBreak = calculatedBreak
        intervalRef.current = setInterval(() => {
            remainingBreak--
            setBreakTime(remainingBreak)

            if (remainingBreak <= 0) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                }
                setIsOnBreak(false)
                setBreakTime(0)
            }
        }, 1000)
    }

    // Reset everything
    const reset = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
        setIsWorking(false)
        setWorkTime(0)
        setBreakTime(0)
        setIsOnBreak(false)
        setFlowLevel(0)
    }

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Zap className="w-8 h-8 text-yellow-500" />
                        Flowmodoro Timer
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Work in your natural flow, break proportionally (work / 5)
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Work Timer */}
                    <Card className={cn(
                        "p-8 border-2 transition-all",
                        isWorking ? "border-yellow-500/50 bg-yellow-500/5" : "border-border"
                    )}>
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground mb-2">
                                    {isWorking ? "In Flow State" : isOnBreak ? "On Break" : "Ready to Focus"}
                                </div>
                                <motion.div
                                    className={cn(
                                        "text-6xl font-bold tabular-nums",
                                        isWorking ? "text-yellow-500" : "text-muted-foreground"
                                    )}
                                    animate={{
                                        scale: isWorking ? [1, 1.05, 1] : 1,
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: isWorking ? Infinity : 0,
                                    }}
                                >
                                    {formatTime(isOnBreak ? breakTime : workTime)}
                                </motion.div>
                            </div>

                            {/* Flow Level Indicator */}
                            {isWorking && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Flow Level</span>
                                        <span className="font-medium text-yellow-500">
                                            {Math.floor(flowLevel)}%
                                        </span>
                                    </div>
                                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${flowLevel}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Controls */}
                            <div className="flex gap-3 justify-center">
                                {!isWorking && !isOnBreak && (
                                    <Button
                                        size="lg"
                                        onClick={startWork}
                                        className="w-full bg-yellow-500 hover:bg-yellow-600"
                                    >
                                        <Play className="w-5 h-5 mr-2" />
                                        Start Flow Session
                                    </Button>
                                )}

                                {isWorking && (
                                    <Button
                                        size="lg"
                                        onClick={stopWork}
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        <Pause className="w-5 h-5 mr-2" />
                                        End Session & Take Break
                                    </Button>
                                )}

                                {(isWorking || isOnBreak) && (
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={reset}
                                    >
                                        <RotateCcw className="w-5 h-5 mr-2" />
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Info & Stats */}
                    <div className="space-y-4">
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4">How It Works</h3>
                            <ol className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex gap-2">
                                    <span className="font-bold text-foreground">1.</span>
                                    <span>Start a flow session when you're ready to focus</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold text-foreground">2.</span>
                                    <span>Work as long as you feel productive and focused</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold text-foreground">3.</span>
                                    <span>When you stop, your break time = work time / 5</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold text-foreground">4.</span>
                                    <span>Take your break, then start a new session!</span>
                                </li>
                            </ol>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                            <h3 className="font-semibold mb-2">💡 Example</h3>
                            <p className="text-sm text-muted-foreground">
                                Work for 50 minutes → Get a 10 minute break<br />
                                Work for 25 minutes → Get a 5 minute break<br />
                                Perfect for variable-length tasks!
                            </p>
                        </Card>

                        {isOnBreak && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="p-6 rounded-lg bg-green-500/10 border border-green-500/20"
                            >
                                <h3 className="font-semibold text-green-600 mb-2">
                                    Break Time! 🎉
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    You worked for {formatTime(workTime)}.<br />
                                    Enjoy your {formatTime(Math.floor(workTime / 5))} break!
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
