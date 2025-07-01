"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../lib/theme-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  BookOpen,
  Plus,
  LogOut,
  Calendar,
  Heart,
  TrendingUp,
  User,
  CheckSquare,
  Moon,
  Sun,
  Monitor,
} from "lucide-react"
import { motion } from "framer-motion"
import EntryList from "@/components/entry-list"
import EntryForm from "@/components/entry-form"
import TodoKanban from "./todo-kanban"
import Profile from "./profile"
import dashboardCache from "../services/dashboardCache"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    entries: [],
    todos: [],
    stats: {
      totalEntries: 0,
      totalTodos: 0,
      completedTodos: 0,
      currentStreak: 0,
    },
  })
  const [isLoading, setIsLoading] = useState(false)

  // Only load cached data for dashboard overview - no API calls
  useEffect(() => {
    if (activeTab === "overview") {
      loadCachedDashboardData()
    }
  }, [activeTab])

  const loadCachedDashboardData = () => {
    console.log("📊 Loading cached dashboard data...")

    // Load from cache only - no API calls on dashboard
    const cachedEntries = dashboardCache.getRecentEntries() || []

    // Calculate basic stats from cached data
    const stats = {
      totalEntries: cachedEntries.length,
      totalTodos: 0, // Will be updated when todos tab is visited
      completedTodos: 0,
      currentStreak: calculateStreak(cachedEntries),
    }

    setDashboardData({
      entries: cachedEntries,
      todos: [],
      stats,
    })

    console.log("✅ Dashboard data loaded from cache:", {
      entries: cachedEntries.length,
      streak: stats.currentStreak,
    })
  }

  const calculateStreak = (entries) => {
    if (!entries.length) return 0
    const sortedEntries = entries.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    let streak = 0
    let currentDate = new Date()

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date || entry.createdAt)
      const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24))

      if (diffDays === streak) {
        streak++
        currentDate = entryDate
      } else {
        break
      }
    }
    return streak
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleNewEntry = () => {
    console.log("➕ Creating new entry")
    setEditingEntry(null)
    setShowEntryForm(true)
    setActiveTab("entries")
  }

  const handleEditEntry = (entry) => {
    console.log("✏️ Editing entry:", entry._id)
    console.log("✏️ Entry data:", entry)

    // Set the editing entry first
    setEditingEntry({
      ...entry,
      _id: entry._id,
      title: entry.title,
      entry: entry.entry || entry.content,
      mood: entry.mood || "neutral",
      date: entry.date,
      images: entry.images || [],
      links: entry.links || [],
    })

    // Then show the form and switch to entries tab
    setShowEntryForm(true)
    setActiveTab("entries")

    // Update URL to reflect edit state
    const url = new URL(window.location)
    url.searchParams.set("tab", "entries")
    url.searchParams.set("edit", "true")
    window.history.pushState({}, "", url)
  }

  const handleSaveEntry = (savedEntry) => {
    console.log("💾 Entry saved:", savedEntry)
    setShowEntryForm(false)
    setEditingEntry(null)

    // Clear URL parameters
    const url = new URL(window.location)
    url.searchParams.delete("edit")
    window.history.pushState({}, "", url)

    // Update cache with new/updated entry
    if (savedEntry) {
      if (editingEntry) {
        dashboardCache.updateEntry(savedEntry)
      } else {
        dashboardCache.addEntry(savedEntry)
      }

      // Refresh dashboard data if we're on overview
      if (activeTab === "overview") {
        loadCachedDashboardData()
      }
    }
  }

  const handleCancelEntry = () => {
    console.log("❌ Entry editing cancelled")
    setShowEntryForm(false)
    setEditingEntry(null)

    // Clear URL parameters
    const url = new URL(window.location)
    url.searchParams.delete("edit")
    window.history.pushState({}, "", url)
  }

  const ThemeToggle = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        const themes = ["light", "dark", "system"]
        const currentIndex = themes.indexOf(theme)
        const nextTheme = themes[(currentIndex + 1) % themes.length]
        setTheme(nextTheme)
      }}
      className="w-9 h-9"
    >
      {theme === "light" && <Sun className="h-4 w-4" />}
      {theme === "dark" && <Moon className="h-4 w-4" />}
      {theme === "system" && <Monitor className="h-4 w-4" />}
    </Button>
  )

  const getInitials = (name) => {
    if (!name) return user?.username?.charAt(0).toUpperCase() || "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Chart data
  const moodData = dashboardData.entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1
    return acc
  }, {})

  const moodChartData = Object.entries(moodData).map(([mood, count]) => ({
    mood,
    count,
    fill: {
      happy: "hsl(var(--chart-1))",
      sad: "hsl(var(--chart-2))",
      neutral: "hsl(var(--chart-3))",
      excited: "hsl(var(--chart-4))",
      angry: "hsl(var(--chart-5))",
    }[mood],
  }))

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayEntries = dashboardData.entries.filter(
      (entry) => new Date(entry.date || entry.createdAt).toDateString() === date.toDateString(),
    ).length

    return {
      day: date.toLocaleDateString("en", { weekday: "short" }),
      entries: dayEntries,
    }
  }).reverse()

  const navItems = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "entries", label: "Entries", icon: BookOpen },
    { id: "todos", label: "Todos", icon: CheckSquare },
  ]

  // Add this useEffect after the existing ones
  useEffect(() => {
    // Handle URL parameters for navigation
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get("tab")
    const shouldEdit = urlParams.get("edit")

    if (tab && tab !== activeTab) {
      setActiveTab(tab)
    }

    // Don't automatically show edit form based on URL params
    // Let the edit handler manage this
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center"
              >
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold">MyDiary</h1>
                <p className="text-xs text-muted-foreground">Welcome back, {user?.name || user?.username}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(item.id)}
                  className="flex items-center gap-2 px-4"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || user?.username} />
                      <AvatarFallback className="text-xs">{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name || user?.username}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("overview")}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 py-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className="flex-1 flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overview Tab - Uses cached data only */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Dashboard</h2>
                  <p className="text-muted-foreground">Track your progress and manage your entries</p>
                </div>
                <Button onClick={handleNewEntry} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Entry
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Recent Entries",
                    value: dashboardData.stats.totalEntries,
                    icon: BookOpen,
                    description: "Cached entries",
                    color: "text-blue-600",
                  },
                  {
                    title: "Todo Tasks",
                    value: `${dashboardData.stats.completedTodos}/${dashboardData.stats.totalTodos}`,
                    icon: CheckSquare,
                    description: "Visit todos tab",
                    color: "text-green-600",
                  },
                  {
                    title: "Current Streak",
                    value: dashboardData.stats.currentStreak,
                    icon: TrendingUp,
                    description: "Days in a row",
                    color: "text-orange-600",
                  },
                  {
                    title: "This Week",
                    value: weeklyData.reduce((sum, day) => sum + day.entries, 0),
                    icon: Calendar,
                    description: "Recent entries",
                    color: "text-purple-600",
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Recent Entries */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Entries</CardTitle>
                    <CardDescription>Your latest journal entries (cached)</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setActiveTab("entries")}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {dashboardData.entries.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No cached entries</h3>
                      <p className="text-muted-foreground mb-4">Visit the entries tab to load your journal entries</p>
                      <Button onClick={() => setActiveTab("entries")}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Go to Entries
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dashboardData.entries.slice(0, 5).map((entry, index) => (
                        <motion.div
                          key={entry._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleEditEntry(entry)}
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{entry.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(entry.date || entry.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {entry.mood}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Charts */}
              {dashboardData.entries.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Activity</CardTitle>
                      <CardDescription>Your journaling activity this week (cached data)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          entries: {
                            label: "Entries",
                            color: "hsl(var(--chart-1))",
                          },
                        }}
                        className="h-[200px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="entries" fill="var(--color-entries)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Mood Distribution</CardTitle>
                      <CardDescription>Your emotional patterns (cached data)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          count: {
                            label: "Count",
                          },
                        }}
                        className="h-[200px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={moodChartData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="count"
                              label={({ mood, count }) => `${mood}: ${count}`}
                            >
                              {moodChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Entries Tab - Fetches data when accessed */}
          {activeTab === "entries" && (
            <>
              {showEntryForm ? (
                <EntryForm entry={editingEntry} onSave={handleSaveEntry} onCancel={handleCancelEntry} />
              ) : (
                <EntryList onNewEntry={handleNewEntry} onEditEntry={handleEditEntry} onViewEntry={handleEditEntry} />
              )}
            </>
          )}

          {/* Todos Tab - Fetches data when accessed */}
          {activeTab === "todos" && <TodoKanban />}

          {/* Profile Tab */}
          {activeTab === "profile" && <Profile />}
        </motion.div>
      </main>
    </div>
  )
}
