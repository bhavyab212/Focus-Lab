"use client"

import { useState } from "react"
import { Edit2, Check, Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MOTIVATIONAL_QUOTES } from "@/lib/types"
import { getRandomQuote } from "@/lib/utils"

interface QuoteSectionProps {
  quote: string
  onQuoteChange: (quote: string) => void
}

export function QuoteSection({ quote, onQuoteChange }: QuoteSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedQuote, setEditedQuote] = useState(quote)

  const handleSave = () => {
    if (editedQuote.trim()) {
      onQuoteChange(editedQuote.trim())
    }
    setIsEditing(false)
  }

  const handleRandomize = () => {
    const newQuote = getRandomQuote(MOTIVATIONAL_QUOTES.filter((q) => q !== quote))
    onQuoteChange(newQuote)
    setEditedQuote(newQuote)
  }

  return (
    <div className="bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl border border-primary/20 p-4 relative group h-full">
      <div className="flex items-start gap-3 h-full">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-primary">Weekly Motivation</h3>
            <div className="flex items-center gap-1">
              {!isEditing && (
                <>
                  <Button
                    onClick={handleRandomize}
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 text-primary/70 hover:text-primary"
                    title="Get new quote"
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
            <p className="text-sm text-foreground/80 italic leading-relaxed">"{quote}"</p>
          )}
        </div>
      </div>
    </div>
  )
}
