"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { BookOpen, Calendar, Edit, Trash2, Eye, ImageIcon, Link, Plus, Search, MoreVertical } from "lucide-react"
import { motion } from "framer-motion"
import diaryApi from "../services/diaryApi"

const MOODS = {
  happy: { emoji: "😊", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
  sad: { emoji: "😢", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
  neutral: { emoji: "😐", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400" },
  excited: { emoji: "🤩", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
  angry: { emoji: "😠", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
}

export default function EntryList({ onNewEntry, onEditEntry }) {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [filteredEntries, setFilteredEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [moodFilter, setMoodFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Only fetch entries when this component mounts (not on dashboard)
  useEffect(() => {
    fetchEntries()
  }, [])

  useEffect(() => {
    filterAndSortEntries()
  }, [entries, searchTerm, moodFilter, sortBy])

  const fetchEntries = async () => {
    setIsLoading(true)
    setError("")

    try {
      console.log("🔄 Fetching all entries...")
      const result = await diaryApi.getAllEntries()

      if (result.success) {
        setEntries(result.data)
        console.log("✅ Entries fetched successfully:", result.data.length)
      } else {
        setError(result.message)
        console.error("❌ Failed to fetch entries:", result.message)
      }
    } catch (err) {
      console.error("❌ Entry fetch error:", err)
      setError("Failed to fetch entries")
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortEntries = () => {
    let filtered = [...entries]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.entry || entry.content || "").toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Mood filter
    if (moodFilter !== "all") {
      filtered = filtered.filter((entry) => entry.mood === moodFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
        case "oldest":
          return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredEntries(filtered)
  }

  const handleDelete = async (entryId, e) => {
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return
    }

    try {
      console.log("🗑️ Deleting entry:", entryId)
      const result = await diaryApi.deleteEntry(entryId)

      if (result.success) {
        setEntries((prev) => prev.filter((entry) => entry._id !== entryId))
        console.log("✅ Entry deleted successfully")
      } else {
        setError(result.message)
        console.error("❌ Failed to delete entry:", result.message)
      }
    } catch (err) {
      console.error("❌ Delete error:", err)
      setError("Failed to delete entry")
    }
  }

  const handleViewEntry = (entry, e) => {
    e.stopPropagation()
    navigate(`/entry/${entry._id}`)
  }

  const handleEditEntry = (entry, e) => {
    e.stopPropagation()
    console.log("✏️ Editing entry from list:", entry)

    // Create a properly formatted entry object with all required fields
    const editEntry = {
      ...entry,
      _id: entry._id,
      title: entry.title || "",
      entry: entry.entry || entry.content || "",
      mood: entry.mood || "neutral",
      date: entry.date || new Date().toISOString().split("T")[0],
      images: entry.images || [],
      links: entry.links || [],
    }

    console.log("✏️ Formatted entry for editing:", editEntry)

    // Call the parent's edit handler with the complete entry object
    onEditEntry(editEntry)
  }

  const handleCardClick = (entry) => {
    navigate(`/entry/${entry._id}`)
  }

  const truncateContent = (content, maxLength = 120) => {
    if (!content) return ""
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  // Add this function to refresh entries after edit
  const refreshEntries = async () => {
    try {
      console.log("🔄 Refreshing entries after edit...")
      const result = await diaryApi.getAllEntries()
      if (result.success) {
        setEntries(result.data)
        console.log("✅ Entries refreshed successfully")
      }
    } catch (err) {
      console.error("❌ Failed to refresh entries:", err)
    }
  }

  // Expose refresh function to parent component
  useEffect(() => {
    if (window.refreshEntryList) {
      window.refreshEntryList = refreshEntries
    }
  }, [])

  const EntryCard = ({ entry, index }) => {
    const mood = MOODS[entry.mood] || MOODS.neutral

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group"
      >
        <Card
          className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full"
          onClick={() => handleCardClick(entry)}
        >
          {/* Header with mood and date */}
          <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
            <div className="flex items-center justify-between">
              <Badge className={mood.color}>
                {mood.emoji} {entry.mood}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(entry.date || entry.createdAt), "MMM d, yyyy")}
                </span>
                {/* Action Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => handleViewEntry(entry, e)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleEditEntry(entry, e)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => handleDelete(entry._id, e)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
              {entry.title}
            </CardTitle>
          </CardHeader>

          {/* Content */}
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-4">
              {truncateContent(entry.entry || entry.content)}
            </p>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                {entry.images && entry.images.length > 0 && (
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {entry.images.length}
                  </span>
                )}
                {entry.links && entry.links.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Link className="w-3 h-3" />
                    {entry.links.length}
                  </span>
                )}
              </div>

              {/* Quick action buttons - visible on hover */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={(e) => handleViewEntry(entry, e)} className="h-6 w-6 p-0">
                  <Eye className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => handleEditEntry(entry, e)} className="h-6 w-6 p-0">
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Your Diary</h2>
          <p className="text-muted-foreground">{filteredEntries.length} entries found</p>
        </div>
        <Button onClick={onNewEntry} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={moodFilter} onValueChange={setMoodFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moods</SelectItem>
                {Object.entries(MOODS).map(([mood, data]) => (
                  <SelectItem key={mood} value={mood}>
                    {data.emoji} {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Entries Grid */}
      {filteredEntries.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {entries.length === 0 ? "No entries yet" : "No entries match your filters"}
                </h3>
                <p className="text-muted-foreground">
                  {entries.length === 0
                    ? "Start your journaling journey by creating your first entry."
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
              {entries.length === 0 && (
                <Button onClick={onNewEntry}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Entry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEntries.map((entry, index) => (
            <EntryCard key={entry._id} entry={entry} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
