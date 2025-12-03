"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  RefreshCw,
  Share2,
  Heart,
  Quote,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Download,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  getDailyThought,
  getRandomThought,
  getTotalThoughtsCount,
  getAllAuthors,
  type ThoughtCategory,
  DAILY_THOUGHTS,
  CATEGORY_METADATA,
} from "@/lib/daily-thoughts"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DailyThoughtCardProps {
  showControls?: boolean
  compact?: boolean
}

const CATEGORY_COLORS: Record<ThoughtCategory, string> = {
  motivation: "from-emerald-500/20 to-green-500/10",
  productivity: "from-blue-500/20 to-cyan-500/10",
  mindfulness: "from-violet-500/20 to-purple-500/10",
  success: "from-amber-500/20 to-yellow-500/10",
  wisdom: "from-indigo-500/20 to-blue-500/10",
  happiness: "from-pink-500/20 to-rose-500/10",
  growth: "from-teal-500/20 to-emerald-500/10",
  focus: "from-orange-500/20 to-red-500/10",
  resilience: "from-rose-500/20 to-pink-500/10",
  leadership: "from-cyan-500/20 to-blue-500/10",
}

const CATEGORY_TEXT: Record<ThoughtCategory, string> = {
  motivation: "text-emerald-600 dark:text-emerald-400",
  productivity: "text-blue-600 dark:text-blue-400",
  mindfulness: "text-violet-600 dark:text-violet-400",
  success: "text-amber-600 dark:text-amber-400",
  wisdom: "text-indigo-600 dark:text-indigo-400",
  happiness: "text-pink-600 dark:text-pink-400",
  growth: "text-teal-600 dark:text-teal-400",
  focus: "text-orange-600 dark:text-orange-400",
  resilience: "text-rose-600 dark:text-rose-400",
  leadership: "text-cyan-600 dark:text-cyan-400",
}

export function DailyThoughtCard({ showControls = true, compact = false }: DailyThoughtCardProps) {
  const [currentThought, setCurrentThought] = useState(getDailyThought())
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState(0)
  const [favorites, setFavorites] = useLocalStorage<number[]>("focuslab-favorite-thoughts", [])
  const [thoughtIndex, setThoughtIndex] = useState(() => {
    const today = new Date()
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
    )
    return dayOfYear % DAILY_THOUGHTS.length
  })
  const [showBrowser, setShowBrowser] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ThoughtCategory | "all">("all")
  const [selectedAuthor, setSelectedAuthor] = useState<string | "all">("all")
  const [offlineCache, setOfflineCache] = useLocalStorage<typeof DAILY_THOUGHTS>("focuslab-offline-thoughts", [])

  const isFavorite = favorites.includes(thoughtIndex)
  const allAuthors = getAllAuthors()

  // Cache thoughts for offline use
  useEffect(() => {
    if (offlineCache.length === 0) {
      setOfflineCache(DAILY_THOUGHTS.slice(0, 100))
    }
  }, [offlineCache.length, setOfflineCache])

  const navigateThought = (dir: number) => {
    setDirection(dir)
    setIsAnimating(true)

    const newIndex = (thoughtIndex + dir + DAILY_THOUGHTS.length) % DAILY_THOUGHTS.length
    setThoughtIndex(newIndex)
    setCurrentThought(DAILY_THOUGHTS[newIndex])

    setTimeout(() => setIsAnimating(false), 300)
  }

  const getNewThought = () => {
    setDirection(1)
    setIsAnimating(true)
    const thought = getRandomThought()
    const index = DAILY_THOUGHTS.findIndex((t) => t.text === thought.text)
    setThoughtIndex(index)
    setCurrentThought(thought)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const selectThought = (thought: (typeof DAILY_THOUGHTS)[0], index: number) => {
    setDirection(1)
    setIsAnimating(true)
    setThoughtIndex(index)
    setCurrentThought(thought)
    setShowBrowser(false)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const toggleFavorite = () => {
    setFavorites((prev) =>
      prev.includes(thoughtIndex) ? prev.filter((i) => i !== thoughtIndex) : [...prev, thoughtIndex],
    )
  }

  const shareThought = async () => {
    const text = `"${currentThought.text}" - ${currentThought.author || "Unknown"}`

    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  const exportFavorites = () => {
    const favoriteThoughts = favorites.map((i) => DAILY_THOUGHTS[i])
    const data = JSON.stringify(favoriteThoughts, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "favorite-quotes.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Filter thoughts for browser
  const filteredThoughts = DAILY_THOUGHTS.filter((thought) => {
    const matchesSearch =
      searchQuery === "" ||
      thought.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (thought.author && thought.author.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || thought.category === selectedCategory
    const matchesAuthor = selectedAuthor === "all" || thought.author === selectedAuthor

    return matchesSearch && matchesCategory && matchesAuthor
  })

  if (compact) {
    return (
      <motion.div
        className={cn(
          "p-4 rounded-xl border bg-gradient-to-br",
          CATEGORY_COLORS[currentThought.category as ThoughtCategory],
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-start gap-3">
          <Quote className={cn("w-5 h-5 shrink-0 mt-0.5", CATEGORY_TEXT[currentThought.category as ThoughtCategory])} />
          <div>
            <p className="text-sm font-medium leading-relaxed">{currentThought.text}</p>
            {currentThought.author && <p className="text-xs text-muted-foreground mt-1">— {currentThought.author}</p>}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        className={cn(
          "relative overflow-hidden rounded-2xl border p-6 bg-gradient-to-br",
          CATEGORY_COLORS[currentThought.category as ThoughtCategory],
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-primary/40 to-transparent blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-tr from-accent/40 to-transparent blur-2xl" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", "bg-background/50")}>
                <Sparkles className={cn("w-4 h-4", CATEGORY_TEXT[currentThought.category as ThoughtCategory])} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Daily Inspiration</h3>
                <p className="text-xs text-muted-foreground capitalize">{currentThought.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {getTotalThoughtsCount().toLocaleString()}+ thoughts
              </span>
              <Dialog open={showBrowser} onOpenChange={setShowBrowser}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Filter className="w-3.5 h-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Browse Quotes</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="browse" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="browse">Browse</TabsTrigger>
                      <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
                      <TabsTrigger value="search">Search</TabsTrigger>
                    </TabsList>

                    <TabsContent value="browse" className="space-y-4">
                      <div className="flex gap-2">
                        <Select
                          value={selectedCategory}
                          onValueChange={(v) => setSelectedCategory(v as ThoughtCategory | "all")}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {Object.entries(CATEGORY_METADATA).map(([key, meta]) => (
                              <SelectItem key={key} value={key}>
                                {meta.icon} {meta.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Author" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Authors</SelectItem>
                            {allAuthors.map((author) => (
                              <SelectItem key={author} value={author}>
                                {author}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2 pr-4">
                          {filteredThoughts.map((thought, index) => (
                            <button
                              key={index}
                              onClick={() => selectThought(thought, DAILY_THOUGHTS.indexOf(thought))}
                              className={cn(
                                "w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors",
                                thoughtIndex === DAILY_THOUGHTS.indexOf(thought) && "ring-2 ring-primary",
                              )}
                            >
                              <p className="text-sm">{thought.text}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">— {thought.author || "Unknown"}</span>
                                <span
                                  className={cn(
                                    "text-xs px-2 py-0.5 rounded-full",
                                    CATEGORY_COLORS[thought.category as ThoughtCategory],
                                  )}
                                >
                                  {thought.category}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="favorites" className="space-y-4">
                      {favorites.length > 0 && (
                        <Button variant="outline" size="sm" onClick={exportFavorites} className="w-full bg-transparent">
                          <Download className="w-4 h-4 mr-2" />
                          Export Favorites
                        </Button>
                      )}
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2 pr-4">
                          {favorites.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No favorites yet</p>
                              <p className="text-xs">Click the heart icon to save quotes</p>
                            </div>
                          ) : (
                            favorites.map((favoriteIndex) => {
                              const thought = DAILY_THOUGHTS[favoriteIndex]
                              if (!thought) return null
                              return (
                                <button
                                  key={favoriteIndex}
                                  onClick={() => selectThought(thought, favoriteIndex)}
                                  className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                  <p className="text-sm">{thought.text}</p>
                                  <p className="text-xs text-muted-foreground mt-1">— {thought.author || "Unknown"}</p>
                                </button>
                              )
                            })
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="search" className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search quotes or authors..."
                          className="pl-9"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2 pr-4">
                          {searchQuery ? (
                            filteredThoughts.length > 0 ? (
                              filteredThoughts.map((thought, index) => (
                                <button
                                  key={index}
                                  onClick={() => selectThought(thought, DAILY_THOUGHTS.indexOf(thought))}
                                  className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                  <p className="text-sm">{thought.text}</p>
                                  <p className="text-xs text-muted-foreground mt-1">— {thought.author || "Unknown"}</p>
                                </button>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No quotes found</p>
                              </div>
                            )
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Type to search quotes</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Quote */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentThought.text}
              initial={{ opacity: 0, x: direction * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[100px] flex flex-col justify-center"
            >
              <div className="flex gap-3">
                <Quote
                  className={cn(
                    "w-8 h-8 shrink-0 opacity-50",
                    CATEGORY_TEXT[currentThought.category as ThoughtCategory],
                  )}
                />
                <div>
                  <p className="text-lg font-medium leading-relaxed text-foreground">{currentThought.text}</p>
                  {currentThought.author && (
                    <p className="text-sm text-muted-foreground mt-3 font-medium">— {currentThought.author}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          {showControls && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => navigateThought(-1)} className="h-8 w-8 p-0">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigateThought(1)} className="h-8 w-8 p-0">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFavorite}
                  className={cn("h-8 w-8 p-0", isFavorite && "text-rose-500")}
                >
                  <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                </Button>
                <Button variant="ghost" size="sm" onClick={shareThought} className="h-8 w-8 p-0">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={getNewThought}
                  disabled={isAnimating}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={cn("w-4 h-4", isAnimating && "animate-spin")} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
