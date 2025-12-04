"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import {
    Play,
    Pause,
    RotateCcw,
    Settings,
    ChevronRight,
    ChevronLeft,
    Bell,
    ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"

// Types
type TimerMode = "focus" | "break" | "rest"
type TimerSettings = {
    focusDuration: number
    breakDuration: number
    restDuration: number
    sound: string
}

const DEFAULT_SETTINGS: TimerSettings = {
    focusDuration: 25,
    breakDuration: 5,
    restDuration: 30,
    sound: "Ding",
}

export function PomodoroTimer() {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // State
    const [settings, setSettings] = useLocalStorage<TimerSettings>(
        "pomodoro-settings-v2",
        DEFAULT_SETTINGS
    )
    const [mode, setMode] = useState<TimerMode>("focus")
    const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60)
    const [isActive, setIsActive] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [sessions, setSessions] = useState(0)

    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Initialize timer when settings change or mode changes
    useEffect(() => {
        const duration =
            mode === "focus" ? settings.focusDuration :
                mode === "break" ? settings.breakDuration :
                    settings.restDuration
        setTimeLeft(duration * 60)
        setIsActive(false)
    }, [settings, mode])

    // Timer Logic
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleTimerComplete()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isActive, timeLeft])

    const handleTimerComplete = () => {
        setIsActive(false)
        playNotificationSound()

        if (mode === "focus") {
            const newSessions = sessions + 1
            setSessions(newSessions)
            if (newSessions % 4 === 0) {
                setMode("rest")
            } else {
                setMode("break")
            }
        } else {
            setMode("focus")
        }
    }

    const playNotificationSound = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.frequency.value = 880
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5)
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.5)
    }

    const toggleTimer = () => setIsActive(!isActive)

    const resetTimer = () => {
        setIsActive(false)
        const duration =
            mode === "focus" ? settings.focusDuration :
                mode === "break" ? settings.breakDuration :
                    settings.restDuration
        setTimeLeft(duration * 60)
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}m ${s.toString().padStart(2, "0")}s`
    }

    // Calculate Progress
    const totalTime =
        mode === "focus" ? settings.focusDuration * 60 :
            mode === "break" ? settings.breakDuration * 60 :
                settings.restDuration * 60
    const progress = ((totalTime - timeLeft) / totalTime) * 100
    const radius = 120
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    if (!mounted) return null

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
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

            <div className="relative z-10 flex gap-8 items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    {!showSettings ? (
                        <motion.div
                            key="timer"
                            initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="w-[380px] h-[480px] rounded-[40px] bg-white/30 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-2xl flex flex-col items-center justify-between p-8 text-slate-800 dark:text-white relative overflow-hidden transition-colors duration-500"
                        >
                            {/* Progress Ring */}
                            <div className="relative mt-4">
                                <svg width="280" height="280" className="transform -rotate-90">
                                    {/* Track */}
                                    <circle
                                        cx="140"
                                        cy="140"
                                        r={radius}
                                        fill="none"
                                        stroke={resolvedTheme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                                        strokeWidth="4"
                                        className="transition-colors duration-500"
                                    />
                                    {/* Progress */}
                                    <circle
                                        cx="140"
                                        cy="140"
                                        r={radius}
                                        fill="none"
                                        stroke="#2DD4BF" // Teal-400
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        className="transition-all duration-1000 ease-linear"
                                    />
                                    {/* Dot Indicator */}
                                    <g transform={`rotate(${(progress / 100) * 360} 140 140)`}>
                                        <circle
                                            cx="140"
                                            cy={140 - radius}
                                            r="8"
                                            fill="#2DD4BF"
                                            className="shadow-[0_0_10px_#2DD4BF]"
                                        />
                                    </g>
                                </svg>

                                {/* Center Content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xs font-medium tracking-[0.2em] text-slate-600 dark:text-white/60 uppercase mb-2 transition-colors duration-500">
                                        {mode}
                                    </span>

                                    {/* Wave Effect Background */}
                                    {isActive && (
                                        <motion.div
                                            key={timeLeft}
                                            initial={{ scale: 0.8, opacity: 0.5 }}
                                            animate={{ scale: 1.5, opacity: 0 }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="absolute w-32 h-32 rounded-full bg-teal-400/20 z-[-1]"
                                        />
                                    )}

                                    <motion.span
                                        key={timeLeft}
                                        initial={{ scale: 1 }}
                                        animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="text-5xl font-light tracking-tight tabular-nums text-slate-900 dark:text-white transition-colors duration-500 relative z-10"
                                    >
                                        {formatTime(timeLeft)}
                                    </motion.span>

                                    {/* Session Dots */}
                                    <div className="flex gap-2 mt-6">
                                        {[0, 1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "w-1.5 h-1.5 rounded-full transition-colors duration-500",
                                                    i < (sessions % 4)
                                                        ? "bg-slate-800 dark:bg-white"
                                                        : "bg-slate-800/20 dark:bg-white/20"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="w-full flex items-center justify-between px-4 mb-2">
                                <motion.div whileTap={{ scale: 0.9 }}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={resetTimer}
                                        className="text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full w-12 h-12 transition-colors duration-500"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                    </Button>
                                </motion.div>

                                <motion.div whileTap={{ scale: 0.9 }}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleTimer}
                                        className="text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full w-16 h-16 transition-colors duration-500"
                                    >
                                        {isActive ? (
                                            <Pause className="w-8 h-8 fill-current" />
                                        ) : (
                                            <Play className="w-8 h-8 fill-current pl-1" />
                                        )}
                                    </Button>
                                </motion.div>

                                <motion.div whileTap={{ scale: 0.9 }}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowSettings(true)}
                                        className="text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full w-12 h-12 transition-colors duration-500"
                                    >
                                        <Settings className="w-6 h-6" />
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="w-[380px] h-[480px] rounded-[40px] bg-white/40 dark:bg-black/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-2xl flex flex-col p-8 text-slate-800 dark:text-white relative overflow-hidden transition-colors duration-500"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-4 mb-8">
                                <motion.div whileTap={{ scale: 0.9 }}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowSettings(false)}
                                        className="text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full -ml-2 transition-colors duration-500"
                                    >
                                        <ArrowLeft className="w-6 h-6" />
                                    </Button>
                                </motion.div>
                                <span className="text-lg font-medium">Settings</span>
                            </div>

                            {/* Settings List */}
                            <div className="flex flex-col gap-6">
                                <div className="group flex items-center justify-between cursor-pointer">
                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-white/50 uppercase tracking-wider mb-1 transition-colors duration-500">Focus</div>
                                        <div className="text-2xl font-light">{settings.focusDuration} min</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <motion.div whileTap={{ scale: 0.9 }}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-500"
                                                onClick={() => setSettings(s => ({ ...s, focusDuration: Math.max(1, s.focusDuration - 5) }))}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                        </motion.div>
                                        <motion.div whileTap={{ scale: 0.9 }}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-500"
                                                onClick={() => setSettings(s => ({ ...s, focusDuration: Math.min(60, s.focusDuration + 5) }))}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="group flex items-center justify-between cursor-pointer">
                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-white/50 uppercase tracking-wider mb-1 transition-colors duration-500">Break</div>
                                        <div className="text-2xl font-light">{settings.breakDuration} min</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <motion.div whileTap={{ scale: 0.9 }}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-500"
                                                onClick={() => setSettings(s => ({ ...s, breakDuration: Math.max(1, s.breakDuration - 1) }))}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                        </motion.div>
                                        <motion.div whileTap={{ scale: 0.9 }}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-500"
                                                onClick={() => setSettings(s => ({ ...s, breakDuration: Math.min(15, s.breakDuration + 1) }))}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="group flex items-center justify-between cursor-pointer">
                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-white/50 uppercase tracking-wider mb-1 transition-colors duration-500">Rest</div>
                                        <div className="text-2xl font-light">{settings.restDuration} min</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <motion.div whileTap={{ scale: 0.9 }}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-500"
                                                onClick={() => setSettings(s => ({ ...s, restDuration: Math.max(5, s.restDuration - 5) }))}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                        </motion.div>
                                        <motion.div whileTap={{ scale: 0.9 }}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-500"
                                                onClick={() => setSettings(s => ({ ...s, restDuration: Math.min(60, s.restDuration + 5) }))}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="group flex items-center justify-between cursor-pointer mt-2">
                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-white/50 uppercase tracking-wider mb-1 transition-colors duration-500">Alarm</div>
                                        <div className="text-2xl font-light">{settings.sound}</div>
                                    </div>
                                    <Bell className="w-5 h-5 text-slate-400 dark:text-white/40 transition-colors duration-500" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
