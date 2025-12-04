export interface Habit {
  id: string
  name: string
  completedDays: Record<string, boolean>
  failedDays: Record<string, boolean> // Track failed days
  color?: string
  icon?: string
  createdAt: string
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  // Habit Loop (Atomic Habits)
  cue?: string
  craving?: string
  response?: string
  reward?: string
  strengthScore?: number
  estimatedDaysToHabit?: number
  progressToHabit?: number
  classification?: "nascent" | "developing" | "forming" | "established" | "automatic"
  targetTimeOfDay?: "morning" | "afternoon" | "evening"
  // Fogg Model attributes
  motivationLevel?: number // 1-10
  abilityLevel?: number // 1-10
  promptType?: "time" | "action" | "location"
}

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  failed: boolean
  dueDate: string
  priority: "high" | "medium" | "low" | "optional"
  status: "not-started" | "in-progress" | "completed" | "failed"
  category: string
  createdAt: string
  completedAt?: string
  failedAt?: string
  failureReason?: string
  pomodorosSpent: number
  estimatedPomodoros: number
  // Timed event support
  startTime?: string // HH:mm format
  endTime?: string // HH:mm format
  isAllDay?: boolean
  // Enhanced recurring support
  recurring?: {
    type: "daily" | "weekly" | "weekdays" | "weekends" | "custom"
    daysOfWeek?: number[] // 0-6 for custom
    interval?: number
    endDate?: string
    parentId?: string // Original task ID for recurring instances
  }
  parentTaskId?: string // For subtasks
  subtasks?: SubTask[]
  tags?: string[]
  notes?: string
}

export interface SubTask {
  id: string
  title: string
  completed: boolean
}

export interface DayTasks {
  date: string
  tasks: Task[]
}

export interface WeekData {
  startDate: string
  quote: string
  habits: Habit[]
  days: DayTasks[]
}

export interface PomodoroSession {
  id: string
  type: "work" | "short-break" | "long-break"
  duration: number
  startedAt: string
  completedAt?: string
  taskId?: string
  habitId?: string // Added habit attribution
}

export interface DailyThought {
  id: number
  text: string
  author?: string
  category: "motivation" | "productivity" | "mindfulness" | "success" | "wisdom" | "happiness" | "growth" | "focus" | "resilience" | "discipline" | "gratitude" | "courage"
  powerLevel?: number // 1-10 rating of impact
}

export interface ThoughtHistory {
  viewedThoughtIds: number[]
  lastResetDate: string
  currentThought: number
}

export interface PomodoroSettings {
  workDuration: number // minutes
  shortBreakDuration: number
  longBreakDuration: number
  sessionsBeforeLongBreak: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  soundEnabled: boolean
  notificationsEnabled: boolean
  flowModeEnabled: boolean
  hapticFeedback: boolean
  tickingSound: boolean
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  notificationsEnabled: true,
  flowModeEnabled: false,
  hapticFeedback: true,
  tickingSound: false,
}

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
export const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export const CATEGORIES = [
  { name: "Work", emoji: "💼", color: "bg-blue-500" },
  { name: "Money", emoji: "💰", color: "bg-emerald-500" },
  { name: "Ideas", emoji: "💡", color: "bg-amber-500" },
  { name: "Chores", emoji: "🏠", color: "bg-orange-500" },
  { name: "Spirituality", emoji: "🧘", color: "bg-violet-500" },
  { name: "Health", emoji: "❤️", color: "bg-rose-500" },
  { name: "Personal", emoji: "🎯", color: "bg-pink-500" },
  { name: "Learning", emoji: "📚", color: "bg-indigo-500" },
]

export const DEFAULT_HABITS = [
  { name: "Wake up early", icon: "⏰" },
  { name: "Review lecture notes", icon: "📝" },
  { name: "Complete assignments", icon: "📚" },
  { name: "Study for 2 hours", icon: "⏱️" },
  { name: "Drink water", icon: "💧" },
  { name: "Exercise", icon: "🏃" },
  { name: "Read textbook", icon: "📖" },
  { name: "Sleep 8 hours", icon: "😴" },
]

export const HABIT_ICONS_CATEGORIZED = {
  "Time & Schedule": ["⏰", "⏱️", "🕐", "🌅", "🌙", "🌄", "⛅"],
  "Fitness & Health": ["🏋️", "🏃", "🚴", "🤸", "🧘", "💪", "❤️", "🫀", "🩺", "💊", "🥗", "🥦", "🍎", "🥤", "💧"],
  "Hygiene & Self-Care": ["🚿", "🛁", "🪥", "🧴", "💆", "🧖", "💅"],
  "Learning & Education": ["📖", "📚", "✍️", "📝", "🎓", "🧠", "💡", "🔬", "🔭", "📊", "📈"],
  "Languages": ["🇬🇧", "🇪🇸", "🇫🇷", "🇩🇪", "🇮🇹", "🇯🇵", "🇰🇷", "🇨🇳", "🗣️", "💬"],
  "Work & Productivity": ["💼", "💻", "⌨️", "🖥️", "📱", "🎯", "✅", "📋", "📌", "🔨", "⚙️"],
  "Finance & Money": ["💵", "💰", "💸", "💳", "🏦", "📈", "💹", "🪙"],
  "Food & Nutrition": ["🍳", "🥘", "🍱", "🥙", "🥗", "🍲", "☕", "🫖", "🧃"],
  "Mindfulness & Spirituality": ["🧘‍♀️", "🧘‍♂️", "🕉️", "☮️", "🙏", "💫", "✨", "⭐", "🌟"],
  "Hobbies & Creativity": ["🎨", "🎭", "🎪", "🎬", "📷", "🎵", "🎸", "🎹", "🎤", "🎧", "✏️", "🖌️", "🖍️"],
  "Nature & Environment": ["🌿", "🌱", "🌳", "🌲", "🌴", "🌻", "🌺", "🌸", "🌼", "🍀", "🌾"],
  "Social & Relationships": ["👥", "👨‍👩‍👧‍👦", "💑", "🤝", "👫", "📞", "💌", "🎁"],
  "Habits & Goals": ["🔥", "⚡", "🎖️", "🏆", "🥇", "🥈", "🥉", "🎗️", "👑"],
  "Avoidance & Restrictions": ["🚫", "⛔", "🙅", "❌", "🚭", "🍺", "🍷", "🍹"],
  "Miscellaneous": ["😊", "😌", "🤗", "🎈", "🎉", "🎊", "🧩", "🎲", "🏡", "🛏️", "🧹", "🧺"],
}

export const HABIT_ICONS = Object.values(HABIT_ICONS_CATEGORIZED).flat()


export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  maxProgress?: number
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_step", name: "First Step", description: "Complete your first habit", icon: "⭐", unlocked: false },
  { id: "week_warrior", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", unlocked: false },
  { id: "habit_master", name: "Habit Master", description: "Reach a 30-day streak", icon: "🏆", unlocked: false },
  { id: "century", name: "Century", description: "Complete 100 habit check-ins", icon: "💯", unlocked: false },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Complete morning habits for 14 days",
    icon: "🌅",
    unlocked: false,
  },
  {
    id: "perfect_week",
    name: "Perfect Week",
    description: "Complete all habits every day for a week",
    icon: "✨",
    unlocked: false,
  },
  {
    id: "pomodoro_pro",
    name: "Pomodoro Pro",
    description: "Complete 50 pomodoro sessions",
    icon: "🍅",
    unlocked: false,
  },
  {
    id: "focus_master",
    name: "Focus Master",
    description: "Complete a 2-hour flow session",
    icon: "🧘",
    unlocked: false,
  },
]

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string // ISO datetime
  endTime: string // ISO datetime
  color?: string
  recurring?: {
    type: "daily" | "weekly" | "monthly" | "yearly"
    interval?: number
    endDate?: string
  }
  reminder?: number // minutes before
}

export const EVENT_COLORS = [
  { name: "Blue", value: "bg-blue-500", text: "text-blue-500" },
  { name: "Green", value: "bg-emerald-500", text: "text-emerald-500" },
  { name: "Red", value: "bg-rose-500", text: "text-rose-500" },
  { name: "Purple", value: "bg-violet-500", text: "text-violet-500" },
  { name: "Orange", value: "bg-orange-500", text: "text-orange-500" },
  { name: "Pink", value: "bg-pink-500", text: "text-pink-500" },
]

export interface MotivationalQuote {
  text: string
  author?: string
  category: "motivation" | "productivity" | "mindfulness" | "success" | "wisdom" | "happiness" | "growth" | "focus"
  tags?: string[]
}

export const MOTIVATIONAL_QUOTES = [
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It does not matter how slowly you go as long as you do not stop.",
]
