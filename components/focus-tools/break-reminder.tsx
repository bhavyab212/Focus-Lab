"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Coffee, Eye, Droplet, Dumbbell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface BreakSettings {
    enabled: boolean
    interval: number // minutes
    eyeReminder: boolean
    stretchReminder: boolean
    hydrationReminder: boolean
}

export function BreakReminder() {
    const [settings, setSettings] = useLocalStorage<BreakSettings>("break-settings", {
        enabled: true,
        interval: 60,
        eyeReminder: true,
        stretchReminder: true,
        hydrationReminder: true,
    })

    const [showReminder, setShowReminder] = useState(false)
    const [timeUntilBreak, setTimeUntilBreak] = useState(settings.interval * 60)
    const [reminderType, setReminderType] = useState<"break" | "eyes" | "hydration">("break")

    useEffect(() => {
        if (!settings.enabled) return

        const interval = setInterval(() => {
            setTimeUntilBreak((prev) => {
                if (prev <= 1) {
                    setShowReminder(true)
                    // Determine reminder type
                    const types: Array<"break" | "eyes" | "hydration"> = ["break"]
                    if (settings.eyeReminder) types.push("eyes")
                    if (settings.hydrationReminder) types.push("hydration")
                    setReminderType(types[Math.floor(Math.random() * types.length)])
                    return settings.interval * 60
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [settings])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const getReminderContent = () => {
        switch (reminderType) {
            case "eyes":
                return {
                    icon: <Eye className="w-12 h-12 text-blue-500" />,
                    title: "Rest Your Eyes",
                    description: "20-20-20 Rule: Look at something 20 feet away for 20 seconds",
                    tips: [
                        "Blink frequently to prevent dry eyes",
                        "Adjust screen brightness to match surroundings",
                        "Position screen 20-24 inches away",
                        "Take a few moments to look out the window",
                    ],
                }
            case "hydration":
                return {
                    icon: <Droplet className="w-12 h-12 text-cyan-500" />,
                    title: "Stay Hydrated",
                    description: "Time to drink some water!",
                    tips: [
                        "Drink a full glass of water",
                        "Aim for 8 glasses throughout the day",
                        "Water helps maintain focus and energy",
                        "Herbal tea is a good alternative",
                    ],
                }
            default:
                return {
                    icon: <Coffee className="w-12 h-12 text-orange-500" />,
                    title: "Take a Break",
                    description: "You've been working hard! Time for a quick break.",
                    tips: [
                        "Stand up and stretch for 2-3 minutes",
                        "Walk around for a few minutes",
                        "Do some light stretches",
                        "Take deep breaths",
                        "Step outside if possible",
                    ],
                }
        }
    }

    const { icon, title, description, tips } = getReminderContent()

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Coffee className="w-8 h-8" />
                        Break Reminder
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Stay healthy with regular breaks and reminders
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Settings */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-6">Settings</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="enabled">Enable Reminders</Label>
                                <Switch
                                    id="enabled"
                                    checked={settings.enabled}
                                    onCheckedChange={(checked) =>
                                        setSettings({ ...settings, enabled: checked })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Break Interval: {settings.interval} minutes</Label>
                                <Slider
                                    value={[settings.interval]}
                                    onValueChange={([value]) =>
                                        setSettings({ ...settings, interval: value })
                                    }
                                    min={15}
                                    max={120}
                                    step={5}
                                    disabled={!settings.enabled}
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-medium">Reminder Types</h3>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        <Label htmlFor="eye">Eye Rest (20-20-20)</Label>
                                    </div>
                                    <Switch
                                        id="eye"
                                        checked={settings.eyeReminder}
                                        onCheckedChange={(checked) =>
                                            setSettings({ ...settings, eyeReminder: checked })
                                        }
                                        disabled={!settings.enabled}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Dumbbell className="w-4 h-4" />
                                        <Label htmlFor="stretch">Stretch Breaks</Label>
                                    </div>
                                    <Switch
                                        id="stretch"
                                        checked={settings.stretchReminder}
                                        onCheckedChange={(checked) =>
                                            setSettings({ ...settings, stretchReminder: checked })
                                        }
                                        disabled={!settings.enabled}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Droplet className="w-4 h-4" />
                                        <Label htmlFor="hydration">Hydration</Label>
                                    </div>
                                    <Switch
                                        id="hydration"
                                        checked={settings.hydrationReminder}
                                        onCheckedChange={(checked) =>
                                            setSettings({ ...settings, hydrationReminder: checked })
                                        }
                                        disabled={!settings.enabled}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Timer Display */}
                    <Card className="p-6 flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <div className="text-sm text-muted-foreground">Next Break In</div>
                            <motion.div
                                className="text-6xl font-bold text-primary tabular-nums"
                                animate={{
                                    scale: timeUntilBreak < 60 ? [1, 1.1, 1] : 1,
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: timeUntilBreak < 60 ? Infinity : 0,
                                }}
                            >
                                {formatTime(timeUntilBreak)}
                            </motion.div>
                            <p className="text-muted-foreground">
                                {settings.enabled ? "Reminders active" : "Reminders paused"}
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Reminder Modal */}
                <AnimatePresence>
                    {showReminder && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowReminder(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-card border rounded-2xl p-8 max-w-md w-full shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        {icon}
                                        <div>
                                            <h2 className="text-2xl font-bold">{title}</h2>
                                            <p className="text-muted-foreground">{description}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowReminder(false)}
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <ul className="space-y-2 mb-6">
                                    {tips.map((tip, i) => (
                                        <li key={i} className="flex gap-2 text-sm">
                                            <span className="text-primary">•</span>
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    onClick={() => setShowReminder(false)}
                                    className="w-full"
                                    size="lg"
                                >
                                    Got it, thanks!
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
