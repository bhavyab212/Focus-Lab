"use client"

import { useState, useEffect } from "react"
import { Edit2, Check, Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { getNextThought, DAILY_THOUGHTS_DATABASE } from "@/lib/daily-thoughts-database"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { DailyThought, ThoughtHistory } from "@/lib/types"

interface QuoteSectionProps {
  quote: string
  onQuoteChange: (quote: string) => void
}

export function QuoteSection({ quote, onQuoteChange }: QuoteSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedQuote, setEditedQuote] = useState(quote)
  const [thoughtHistory, setThoughtHistory] = useLocalStorage<ThoughtHistory>("thought-history", {
    viewedThoughtIds: [],
    lastResetDate: new Date().toISOString(),
    currentThought: 0,
  })
  const [currentThought, setCurrentThought] = useState<DailyThought | null>(null)

  // Initialize current thought from database
  useEffect(() => {
    if (DAILY_THOUGHTS_DATABASE.length > 0) {
      // Find the thought that matches the current quote or get a new one
      const matchingThought = DAILY_THOUGHTS_DATABASE.find(t => t.text === quote)
      if (matchingThought) {
        setCurrentThought(matchingThought)
      } else {
        // Get a new thought
        handleGetNewThought()
      }
    }
  }, [])

  const handleSave = () => {
    if (editedQuote.trim()) {
      onQuoteChange(editedQuote.trim())
    }
    setIsEditing(false)
  }

  const handleGetNewThought = () => {
    const newThought = getNextThought(thoughtHistory.viewedThoughtIds)

    // Update history
    setThoughtHistory({
      ...thoughtHistory,
      viewedThoughtIds: [...thoughtHistory.viewedThoughtIds, newThought.id],
      currentThought: newThought.id,
    })

    // Update display
    setCurrentThought(newThought)
    onQuoteChange(newThought.text)
    setEditedQuote(newThought.text)
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      motivation: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      productivity: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      discipline: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      success: "bg-green-500/10 text-green-600 border-green-500/20",
      wisdom: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      happiness: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      growth: "bg-teal-500/10 text-teal-600 border-teal-500/20",
      focus: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      resilience: "bg-red-500/10 text-red-600 border-red-500/20",
      gratitude: "bg-pink-500/10 text-pink-600 border-pink-500/20",
      courage: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      mindfulness: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    }
    return colors[category] || colors.motivation
  }

  return (
    <div className="bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl border border-primary/20 p-4 relative group h-full">
      <div className="flex items-start gap-3 h-full">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-primary">Daily Thoughts</h3>
              {currentThought && (
                <Badge variant="outline" className={getCategoryColor(currentThought.category)}>
                  {currentThought.category}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!isEditing && (
                <>
                  <Button
                    onClick={handleGetNewThought}
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 text-primary/70 hover:text-primary"
                    title="Get new thought"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    onClick={() => {
                      setEditedQuote(quote)
                      setIsEditing(true)
                    }}
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 text-primary/70 hover:text-primary"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
          {isEditing ? (
            <div className="space-y-2 flex-1">
              <Textarea
                value={editedQuote}
                onChange={(e) => setEditedQuote(e.target.value)}
                className="min-h-[60px] text-sm resize-none bg-background/50"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSave()
                  }
                  if (e.key === "Escape") {
                    setIsEditing(false)
                    setEditedQuote(quote)
                  }
                }}
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" className="h-7">
                  <Check className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false)
                    setEditedQuote(quote)
                  }}
                  size="sm"
                  variant="ghost"
                  className="h-7"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-foreground/80 italic leading-relaxed">"{quote}"</p>
              {currentThought?.author && (
                <p className="text-xs text-muted-foreground">— {currentThought.author}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{thoughtHistory.viewedThoughtIds.length} of {DAILY_THOUGHTS_DATABASE.length} thoughts viewed</span>
                {currentThought?.powerLevel && (
                  <span className="flex items-center gap-1">
                    <span>•</span>
                    <span>Impact: {currentThought.powerLevel}/10</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
