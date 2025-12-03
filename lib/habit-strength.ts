/**
 * Habit Strength Algorithm Module
 *
 * Based on research from:
 * - Lally et al. (2010): "How are habits formed: Modelling habit formation in the real world"
 * - Wood & Rünger (2016): "Psychology of Habit"
 * - Gardner et al. (2012): "Making health habitual"
 *
 * Implements the Fogg Behavior Model (B = MAP: Behavior = Motivation + Ability + Prompt)
 */

export interface HabitStrengthConfig {
  // Weight for repetition frequency (0-1)
  repetitionWeight: number
  // Weight for recency decay (0-1)
  recencyWeight: number
  // Weight for consistency across days (0-1)
  consistencyWeight: number
  // Weight for time-of-day context match (0-1)
  contextWeight: number
  // Decay rate for recency (higher = faster decay)
  recencyDecayRate: number
}

export const DEFAULT_HABIT_STRENGTH_CONFIG: HabitStrengthConfig = {
  repetitionWeight: 0.35,
  recencyWeight: 0.25,
  consistencyWeight: 0.25,
  contextWeight: 0.15,
  recencyDecayRate: 0.1,
}

// Research-backed defaults from Lally et al. (2010)
export const RESEARCH_DEFAULTS: HabitStrengthConfig = {
  repetitionWeight: 0.4,
  recencyWeight: 0.2,
  consistencyWeight: 0.3,
  contextWeight: 0.1,
  recencyDecayRate: 0.08,
}

export interface HabitStrengthResult {
  // Overall strength score (0-100)
  score: number
  // Individual component scores
  repetitionScore: number
  recencyScore: number
  consistencyScore: number
  contextScore: number
  // Estimated days to form habit (based on Lally's research: avg 66 days)
  estimatedDaysToHabit: number
  // Current progress towards habit formation (0-100%)
  progressToHabit: number
  // Habit classification
  classification: "nascent" | "developing" | "forming" | "established" | "automatic"
  // Recommendations
  recommendations: string[]
}

/**
 * Calculate habit strength using weighted components
 */
export function calculateHabitStrength(
  completedDays: Record<string, boolean>,
  config: HabitStrengthConfig = DEFAULT_HABIT_STRENGTH_CONFIG,
  targetTimeOfDay?: string, // e.g., "morning", "afternoon", "evening"
): HabitStrengthResult {
  const entries = Object.entries(completedDays)
    .filter(([_, completed]) => completed)
    .map(([date]) => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime())

  const totalCompletions = entries.length

  if (totalCompletions === 0) {
    return {
      score: 0,
      repetitionScore: 0,
      recencyScore: 0,
      consistencyScore: 0,
      contextScore: 0,
      estimatedDaysToHabit: 66,
      progressToHabit: 0,
      classification: "nascent",
      recommendations: ["Start with a tiny version of this habit", "Set a specific trigger time"],
    }
  }

  // 1. Repetition Score (based on total completions)
  // Asymptotic approach to max (66+ days = 100%)
  const repetitionScore = Math.min(100, (totalCompletions / 66) * 100)

  // 2. Recency Score (exponential decay from last completion)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const lastCompletion = entries[0]
  lastCompletion.setHours(0, 0, 0, 0)
  const daysSinceLastCompletion = Math.floor((today.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24))
  const recencyScore = Math.max(0, 100 * Math.exp(-config.recencyDecayRate * daysSinceLastCompletion))

  // 3. Consistency Score (variance in completion intervals)
  const consistencyScore = calculateConsistencyScore(entries)

  // 4. Context Score (time-of-day matching)
  const contextScore = calculateContextScore(entries, targetTimeOfDay)

  // Weighted total score
  const score = Math.round(
    repetitionScore * config.repetitionWeight +
      recencyScore * config.recencyWeight +
      consistencyScore * config.consistencyWeight +
      contextScore * config.contextWeight,
  )

  // Estimate days to habit using logistic curve (based on Lally et al.)
  const { estimatedDays, progressToHabit } = estimateDaysToHabit(entries, score)

  // Classification
  const classification = getHabitClassification(score, totalCompletions)

  // Generate recommendations
  const recommendations = generateRecommendations(
    score,
    repetitionScore,
    recencyScore,
    consistencyScore,
    contextScore,
    totalCompletions,
  )

  return {
    score,
    repetitionScore: Math.round(repetitionScore),
    recencyScore: Math.round(recencyScore),
    consistencyScore: Math.round(consistencyScore),
    contextScore: Math.round(contextScore),
    estimatedDaysToHabit: estimatedDays,
    progressToHabit,
    classification,
    recommendations,
  }
}

/**
 * Calculate consistency score based on interval variance
 */
function calculateConsistencyScore(completions: Date[]): number {
  if (completions.length < 2) return 50 // Neutral for insufficient data

  const intervals: number[] = []
  for (let i = 0; i < completions.length - 1; i++) {
    const diff = Math.floor((completions[i].getTime() - completions[i + 1].getTime()) / (1000 * 60 * 60 * 24))
    intervals.push(diff)
  }

  // Ideal interval is 1 day for daily habits
  const idealInterval = 1
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length

  // Calculate variance
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length

  // Lower variance = higher consistency score
  // Using exponential decay: perfect consistency (variance=0) = 100, high variance = low score
  const consistencyScore = 100 * Math.exp(-variance / 5)

  // Also penalize if average interval is much greater than ideal
  const intervalPenalty = Math.max(0, 1 - Math.abs(avgInterval - idealInterval) / 7)

  return consistencyScore * intervalPenalty
}

/**
 * Calculate context score based on time-of-day patterns
 */
function calculateContextScore(completions: Date[], targetTimeOfDay?: string): number {
  if (!targetTimeOfDay || completions.length < 3) return 75 // Neutral default

  // Group completions by time of day
  const timeGroups = { morning: 0, afternoon: 0, evening: 0, night: 0 }

  completions.forEach((date) => {
    const hour = date.getHours()
    if (hour >= 5 && hour < 12) timeGroups.morning++
    else if (hour >= 12 && hour < 17) timeGroups.afternoon++
    else if (hour >= 17 && hour < 21) timeGroups.evening++
    else timeGroups.night++
  })

  const total = completions.length
  const targetCount = timeGroups[targetTimeOfDay as keyof typeof timeGroups] || 0

  return (targetCount / total) * 100
}

/**
 * Estimate days to habit formation using logistic curve
 * Based on Lally et al. (2010): average 66 days, range 18-254 days
 */
function estimateDaysToHabit(
  completions: Date[],
  currentScore: number,
): { estimatedDays: number; progressToHabit: number } {
  // Base estimate from research: 66 days average
  const baseEstimate = 66

  if (completions.length === 0) {
    return { estimatedDays: baseEstimate, progressToHabit: 0 }
  }

  // Calculate current progress using logistic curve
  // Habit formation follows S-curve: slow start, rapid middle, plateau at end
  const k = 0.1 // Steepness of curve
  const x0 = 33 // Midpoint (when growth is fastest)

  // Progress percentage based on current score
  const progressToHabit = Math.min(95, currentScore)

  // Estimate remaining days based on current trajectory
  const daysCompleted = completions.length
  const completionRate =
    daysCompleted > 0
      ? completions.length / Math.max(1, daysBetween(completions[completions.length - 1], completions[0]) + 1)
      : 0

  // Adjust estimate based on completion rate
  let estimatedDays: number
  if (completionRate >= 0.9) {
    // Very consistent: might form faster (Lally's minimum was 18 days)
    estimatedDays = Math.max(18, Math.round(baseEstimate - daysCompleted * 0.8))
  } else if (completionRate >= 0.7) {
    // Good consistency: average timeline
    estimatedDays = Math.max(0, baseEstimate - daysCompleted)
  } else {
    // Lower consistency: might take longer (up to 254 days from Lally's research)
    const penalty = 1 + (1 - completionRate)
    estimatedDays = Math.min(254, Math.round((baseEstimate - daysCompleted) * penalty))
  }

  return {
    estimatedDays: Math.max(0, estimatedDays),
    progressToHabit: Math.round(progressToHabit),
  }
}

function daysBetween(date1: Date, date2: Date): number {
  return Math.abs(Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)))
}

/**
 * Classify habit based on strength score and completions
 */
function getHabitClassification(
  score: number,
  totalCompletions: number,
): "nascent" | "developing" | "forming" | "established" | "automatic" {
  if (score < 15 || totalCompletions < 5) return "nascent"
  if (score < 35 || totalCompletions < 15) return "developing"
  if (score < 60 || totalCompletions < 40) return "forming"
  if (score < 85 || totalCompletions < 60) return "established"
  return "automatic"
}

/**
 * Generate personalized recommendations based on Fogg Behavior Model
 */
function generateRecommendations(
  overallScore: number,
  repetitionScore: number,
  recencyScore: number,
  consistencyScore: number,
  contextScore: number,
  totalCompletions: number,
): string[] {
  const recommendations: string[] = []

  // Low repetition: Need more practice
  if (repetitionScore < 40) {
    recommendations.push("Focus on daily practice - even 2 minutes counts")
  }

  // Low recency: Missed recent days
  if (recencyScore < 50) {
    recommendations.push("Get back on track today - a small action restarts momentum")
  }

  // Low consistency: Irregular pattern
  if (consistencyScore < 40) {
    recommendations.push("Link this habit to an existing routine (habit stacking)")
  }

  // Low context: No clear trigger
  if (contextScore < 50) {
    recommendations.push("Set a specific time and place as your trigger")
  }

  // Fogg Model: Ability - make it easier
  if (overallScore < 30) {
    recommendations.push("Make the habit smaller until it feels almost too easy")
  }

  // Fogg Model: Motivation - celebrate wins
  if (totalCompletions > 7 && overallScore < 50) {
    recommendations.push("Celebrate each completion to build positive associations")
  }

  // Near habit formation
  if (overallScore > 70 && overallScore < 90) {
    recommendations.push("You're close! Maintain consistency for 2 more weeks")
  }

  // Limit to top 3 recommendations
  return recommendations.slice(0, 3)
}

/**
 * Calculate habit stacking suggestions
 */
export function getHabitStackingSuggestions(
  existingHabits: Array<{ name: string; strength: number }>,
  newHabitName: string,
): string[] {
  // Find strongest habits as anchors
  const strongHabits = existingHabits
    .filter((h) => h.strength > 60)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)

  return strongHabits.map((h) => `After I ${h.name.toLowerCase()}, I will ${newHabitName.toLowerCase()}`)
}

/**
 * Calculate implementation intentions (if-then plans)
 */
export function generateImplementationIntention(
  habitName: string,
  preferredTime?: string,
  preferredLocation?: string,
): string {
  const time = preferredTime || "[specific time]"
  const location = preferredLocation || "[specific location]"
  return `When it is ${time} and I am at ${location}, I will ${habitName.toLowerCase()}`
}
