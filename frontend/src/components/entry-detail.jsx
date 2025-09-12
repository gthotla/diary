"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Edit, Trash2, Link } from "lucide-react"
import { motion } from "framer-motion"
import diaryApi from "../services/diaryApi"
import ImageSlideshow from "./image-slideshow"

const MOODS = {
  happy: { emoji: "😊", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
  sad: { emoji: "😢", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
  neutral: { emoji: "😐", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400" },
  excited: { emoji: "🤩", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
  angry: { emoji: "😠", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
}

export default function EntryDetail({ onEdit }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [entry, setEntry] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (id) {
      fetchEntry()
    }
  }, [id])

  const fetchEntry = async () => {
    setIsLoading(true)
    setError("")

    try {
      console.log("🔍 Fetching entry details for ID:", id)
      const result = await diaryApi.getEntryById(id)

      if (result.success) {
        setEntry(result.data)
        console.log("✅ Entry details loaded:", result.data)
      } else {
        setError(result.message)
        console.error("❌ Failed to fetch entry:", result.message)
      }
    } catch (err) {
      console.error("❌ Entry fetch error:", err)
      setError("Failed to fetch entry")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return
    }

    try {
      console.log("🗑️ Deleting entry:", id)
      const result = await diaryApi.deleteEntry(id)

      if (result.success) {
        console.log("✅ Entry deleted successfully")
        navigate("/dashboard?tab=entries")
      } else {
        setError(result.message)
        console.error("❌ Failed to delete entry:", result.message)
      }
    } catch (err) {
      console.error("❌ Delete error:", err)
      setError("Failed to delete entry")
    }
  }

  const handleEdit = () => {
    console.log("✏️ Editing entry from detail view:", entry)

    // Create a properly formatted entry object
    const editEntry = {
      ...entry,
      _id: entry._id,
      title: entry.title,
      entry: entry.entry || entry.content,
      mood: entry.mood || "neutral",
      date: entry.date,
      images: entry.images || [],
      links: entry.links || [],
    }

    console.log("✏️ Formatted entry for editing:", editEntry)

    if (onEdit) {
      onEdit(editEntry)
    }

    // Navigate to dashboard with entries tab and edit mode
    navigate("/dashboard?tab=entries&edit=true")
  }

  const handleBackToEntries = () => {
    navigate("/dashboard?tab=entries")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-10 w-32" />
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-64 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={handleBackToEntries} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Entries
            </Button>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={handleBackToEntries} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Entries
            </Button>
            <Alert>
              <AlertDescription>Entry not found</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  const mood = MOODS[entry.mood] || MOODS.neutral

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <Button variant="ghost" onClick={handleBackToEntries}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Entries
            </Button>
            <div className="flex gap-2">
              <Button onClick={handleEdit} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleDelete} variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </motion.div>

          {/* Entry Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="overflow-hidden">
              {/* Header with mood and date */}
              <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <Badge className={mood.color}>
                    {mood.emoji} {entry.mood}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(entry.date || entry.createdAt), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <CardTitle className="text-3xl font-bold leading-tight">{entry.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Entry Content */}
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap leading-relaxed text-lg">{entry.entry || entry.content}</p>
                </div>

                {/* Image Slideshow */}
                {entry.images && entry.images.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21,15 16,10 5,21" />
                      </svg>
                      Images ({entry.images.length})
                    </h3>
                    <ImageSlideshow images={entry.images} title={entry.title} />
                  </div>
                )}

                {/* Videos */}
                {entry.videos && entry.videos.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                      Videos ({entry.videos.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {entry.videos.map((video, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                              <video
                                src={video.url}
                                controls
                                className="w-full h-full object-cover rounded-lg"
                                poster={video.thumbnail}
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                            <p className="text-sm text-center text-muted-foreground">
                              {video.name || `Video ${index + 1}`}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {entry.links && entry.links.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Link className="w-5 h-5" />
                      Links ({entry.links.length})
                    </h3>
                    <div className="space-y-3">
                      {entry.links.map((link, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Link className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline break-all"
                              >
                                {link}
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-6 border-t space-y-2 text-sm text-muted-foreground">
                  <p>Created: {format(new Date(entry.date || entry.createdAt), "PPP 'at' p")}</p>
                  {entry.updatedAt && entry.updatedAt !== (entry.date || entry.createdAt) && (
                    <p>Last updated: {format(new Date(entry.updatedAt), "PPP 'at' p")}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
