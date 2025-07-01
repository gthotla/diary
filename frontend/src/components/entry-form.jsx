"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CalendarIcon, Save, X, Upload, Loader2, ImageIcon, Link, Smile } from "lucide-react"
import { cn } from "@/lib/utils"
import diaryApi from "../services/diaryApi"

const MOODS = [
  { value: "happy", label: "Happy", emoji: "😊", color: "bg-green-100 text-green-800" },
  { value: "sad", label: "Sad", emoji: "😢", color: "bg-blue-100 text-blue-800" },
  { value: "neutral", label: "Neutral", emoji: "😐", color: "bg-gray-100 text-gray-800" },
  { value: "excited", label: "Excited", emoji: "🤩", color: "bg-yellow-100 text-yellow-800" },
  { value: "angry", label: "Angry", emoji: "😠", color: "bg-red-100 text-red-800" },
]

export default function EntryForm({ entry = null, onSave, onCancel }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedDate, setSelectedDate] = useState(entry?.date ? new Date(entry.date) : new Date())
  const [selectedImages, setSelectedImages] = useState([])
  const [existingImages, setExistingImages] = useState(entry?.images || [])
  const [links, setLinks] = useState(entry?.links || [])
  const [newLink, setNewLink] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    entry: "",
    mood: "neutral",
    date: new Date().toISOString().split("T")[0],
  })

  // Initialize form data when entry prop changes
  useEffect(() => {
    if (entry) {
      console.log("📝 Loading entry for editing:", entry)
      setFormData({
        title: entry.title || "",
        entry: entry.entry || entry.content || "",
        mood: entry.mood || "neutral",
        date: entry.date || new Date().toISOString().split("T")[0],
      })
      setSelectedDate(entry.date ? new Date(entry.date) : new Date())
      setExistingImages(entry.images || [])
      setLinks(entry.links || [])
      setSelectedImages([]) // Reset new images when editing
    } else {
      // Reset form for new entry
      console.log("📝 Creating new entry")
      setFormData({
        title: "",
        entry: "",
        mood: "neutral",
        date: new Date().toISOString().split("T")[0],
      })
      setSelectedDate(new Date())
      setExistingImages([])
      setLinks([])
      setSelectedImages([])
    }
    setError("")
    setSuccess("")
  }, [entry])

  const handleInputChange = (field, value) => {
    console.log(`📝 Updating ${field}:`, value)
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      }
      console.log("📝 Updated form data:", updated)
      return updated
    })

    if (error) setError("")
    if (success) setSuccess("")
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    handleInputChange("date", date.toISOString().split("T")[0])
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)

    // Validate files
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError("Some images are too large (max 5MB each)")
        return false
      }
      if (!file.type.startsWith("image/")) {
        setError("Please select only image files")
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...validFiles])
      setError("") // Clear any previous errors
    }
  }

  const removeNewImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const addLink = () => {
    if (newLink.trim()) {
      // Basic URL validation
      try {
        new URL(newLink.trim())
        setLinks((prev) => [...prev, newLink.trim()])
        setNewLink("")
      } catch {
        // If not a valid URL, add http:// prefix
        const urlWithProtocol = newLink.trim().startsWith("http") ? newLink.trim() : `https://${newLink.trim()}`
        setLinks((prev) => [...prev, urlWithProtocol])
        setNewLink("")
      }
    }
  }

  const removeLink = (index) => {
    setLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!formData.title.trim() || !formData.entry.trim()) {
      setError("Title and content are required")
      setIsLoading(false)
      return
    }

    let result // Declare result variable here

    try {
      console.log("💾 Submitting entry:", {
        isEdit: !!entry,
        entryId: entry?._id,
        formData,
        newImages: selectedImages.length,
        existingImages: existingImages.length,
        links: links.length,
      })

      // Prepare data for submission - use regular object for text-only updates
      if (selectedImages.length === 0) {
        // No new images, send as JSON
        const submitData = {
          title: formData.title.trim(),
          entry: formData.entry.trim(),
          mood: formData.mood,
          date: formData.date,
          links: links,
          existingImages: existingImages,
        }

        console.log("📤 Sending JSON data:", submitData)

        if (entry) {
          result = await diaryApi.updateEntry(entry._id, submitData)
        } else {
          result = await diaryApi.createEntry(submitData)
        }
      } else {
        // Has new images, use FormData
        const submitData = new FormData()
        submitData.append("title", formData.title.trim())
        submitData.append("entry", formData.entry.trim())
        submitData.append("mood", formData.mood)
        submitData.append("date", formData.date)

        if (links.length > 0) {
          submitData.append("links", JSON.stringify(links))
        }

        if (entry && existingImages.length > 0) {
          submitData.append("existingImages", JSON.stringify(existingImages))
        }

        selectedImages.forEach((image) => {
          submitData.append("images", image)
        })

        console.log("📤 Sending FormData with images")

        if (entry) {
          result = await diaryApi.updateEntry(entry._id, submitData)
        } else {
          result = await diaryApi.createEntry(submitData)
        }
      }

      if (result.success) {
        const message = entry ? "Entry updated successfully!" : "Entry created successfully!"
        setSuccess(message)
        console.log("✅", message)

        // Refresh the entry list if available
        if (window.refreshEntryList) {
          await window.refreshEntryList()
        }

        // Wait a moment to show success message, then call onSave
        setTimeout(() => {
          if (onSave) {
            onSave(result.data)
          }
        }, 1000)
      } else {
        console.error("❌ Save failed:", result.message)
        setError(result.message || "Failed to save entry")
      }
    } catch (err) {
      console.error("❌ Entry save error:", err)
      setError("An error occurred while saving the entry")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedMood = MOODS.find((mood) => mood.value === formData.mood)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smile className="w-5 h-5" />
          {entry ? "Edit Entry" : "New Diary Entry"}
        </CardTitle>
        <CardDescription>{entry ? "Update your diary entry" : "Capture your thoughts and memories"}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Title and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="What's on your mind today?"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Mood Selection */}
          <div className="space-y-2">
            <Label>Mood</Label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((mood) => (
                <Button
                  key={mood.value}
                  type="button"
                  variant={formData.mood === mood.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange("mood", mood.value)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <span>{mood.emoji}</span>
                  {mood.label}
                </Button>
              ))}
            </div>
            {selectedMood && (
              <Badge className={selectedMood.color}>
                {selectedMood.emoji} {selectedMood.label}
              </Badge>
            )}
          </div>

          {/* Entry Content */}
          <div className="space-y-2">
            <Label htmlFor="entry">Content *</Label>
            <Textarea
              id="entry"
              value={formData.entry}
              onChange={(e) => handleInputChange("entry", e.target.value)}
              placeholder="Write your thoughts here..."
              rows={8}
              required
              disabled={isLoading}
              className="resize-none"
            />
          </div>

          {/* Existing Images (for edit mode) */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <Label>Current Images</Label>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative">
                    <Badge variant="secondary" className="pr-6">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      Image {index + 1}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0"
                      onClick={() => removeExistingImage(index)}
                      disabled={isLoading}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Image Upload */}
          <div className="space-y-2">
            <Label>Add Images</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                disabled={isLoading}
                className="hidden"
                id="image-upload"
              />
              <Label htmlFor="image-upload" className="cursor-pointer">
                <Button type="button" variant="outline" asChild disabled={isLoading}>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </span>
                </Button>
              </Label>
            </div>

            {selectedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <Badge variant="secondary" className="pr-6">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      {image.name}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0"
                      onClick={() => removeNewImage(index)}
                      disabled={isLoading}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="space-y-2">
            <Label>Links</Label>
            <div className="flex gap-2">
              <Input
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="Add a link..."
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addLink()
                  }
                }}
              />
              <Button type="button" onClick={addLink} variant="outline" disabled={isLoading || !newLink.trim()}>
                <Link className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {links.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {links.map((link, index) => (
                  <div key={index} className="relative">
                    <Badge variant="outline" className="pr-6 max-w-xs">
                      <Link className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{link.length > 30 ? `${link.substring(0, 30)}...` : link}</span>
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0"
                      onClick={() => removeLink(index)}
                      disabled={isLoading}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {entry ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {entry ? "Update Entry" : "Save Entry"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
