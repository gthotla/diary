"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../lib/theme-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, User, Settings, Bell, Palette, Save, Loader2, Edit, Camera, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import authService from "../services/authService"

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
  "Pacific/Auckland",
]

export default function Profile() {
  const { user, updateUserProfile, updateUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState(null)
  const [profileImage, setProfileImage] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState("")

  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    dob: "",
    timezone: "UTC",
    notifications: true,
    theme: "system",
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        bio: user.bio || "",
        dob: user.dob || "",
        timezone: user.timezone || "UTC",
        notifications: user.notifications !== false,
        theme: user.theme || theme || "system",
      })

      if (user.dob) {
        try {
          setDateOfBirth(new Date(user.dob))
        } catch (error) {
          console.error("Invalid date:", user.dob)
        }
      }

      if (user.avatar) {
        setProfileImagePreview(user.avatar)
      }
    }
  }, [user, theme])

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (error) setError("")
    if (success) setSuccess("")
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    handleInputChange("theme", newTheme)
  }

  const handleDateSelect = (date) => {
    setDateOfBirth(date)
    handleInputChange("dob", date ? date.toISOString().split("T")[0] : "")
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      setProfileImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setProfileImage(null)
    setProfileImagePreview(user?.avatar || "")
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Create FormData if we have a new image
      let submitData
      if (profileImage) {
        submitData = new FormData()
        Object.keys(profileData).forEach((key) => {
          if (profileData[key] !== undefined && profileData[key] !== null) {
            submitData.append(key, profileData[key])
          }
        })
        submitData.append("avatar", profileImage)
      } else {
        submitData = profileData
      }

      const result = await updateUserProfile(submitData)

      if (result.success) {
        setSuccess("Profile updated successfully!")
        setIsEditing(false)
        setProfileImage(null)

        // Fetch updated user data
        const userResult = await authService.getCurrentUser()
        if (userResult.success) {
          updateUser(userResult.user)
        }
      } else {
        setError(result.message || "Failed to update profile")
      }
    } catch (err) {
      console.error("Profile save error:", err)
      setError("An error occurred while updating profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setProfileData({
        name: user.name || "",
        bio: user.bio || "",
        dob: user.dob || "",
        timezone: user.timezone || "UTC",
        notifications: user.notifications !== false,
        theme: user.theme || "system",
      })

      if (user.dob) {
        setDateOfBirth(new Date(user.dob))
      }

      setProfileImagePreview(user.avatar || "")
      setProfileImage(null)
    }
    setIsEditing(false)
    setError("")
    setSuccess("")
  }

  const getInitials = (name) => {
    if (!name) return user?.username?.charAt(0).toUpperCase() || "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <CardContent className="relative pt-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                  <AvatarImage
                    src={profileImagePreview || user?.avatar || "/placeholder.svg"}
                    alt={user?.name || user?.username}
                  />
                  <AvatarFallback className="text-2xl font-bold">{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <Label htmlFor="profile-image-upload" className="cursor-pointer">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                        asChild
                      >
                        <span>
                          <Camera className="w-4 h-4" />
                        </span>
                      </Button>
                    </Label>
                    {profileImage && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -left-2 rounded-full w-6 h-6 p-0"
                        onClick={removeImage}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">{user?.name || user?.username || "User"}</h1>
                    <p className="text-muted-foreground">@{user?.username || "username"}</p>
                    {user?.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                  </div>
                  <div className="flex gap-2 justify-center md:justify-start">
                    <Badge variant="secondary">
                      <User className="w-3 h-3 mr-1" />
                      {user?.role || "User"}
                    </Badge>
                    <Badge variant="outline">
                      <Palette className="w-3 h-3 mr-1" />
                      {theme} theme
                    </Badge>
                  </div>
                </div>

                {(user?.bio || profileData.bio) && (
                  <p className="text-muted-foreground mb-4">{user?.bio || profileData.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center md:justify-start">
                  <span>
                    Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
                  </span>
                  <span>•</span>
                  <span>{user?.entriesCount || 0} entries</span>
                  <span>•</span>
                  <span>{user?.todosCount || 0} todos</span>
                </div>
              </div>

              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerts */}
      {error && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {success && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Manage your personal details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="p-3 bg-muted/50 rounded-md">{profileData.name || "Not set"}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="p-3 bg-muted/50 rounded-md text-muted-foreground">{user?.username || ""}</div>
                <p className="text-xs text-muted-foreground">Username cannot be changed</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <div className="space-y-1">
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">{profileData.bio.length}/500 characters</p>
                </div>
              ) : (
                <div className="p-3 bg-muted/50 rounded-md min-h-[80px]">{profileData.bio || "No bio added yet"}</div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateOfBirth && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={handleDateSelect}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="p-3 bg-muted/50 rounded-md">
                    {dateOfBirth ? format(dateOfBirth, "PPP") : "Not set"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                {isEditing ? (
                  <Select value={profileData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-muted/50 rounded-md">{profileData.timezone}</div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Preferences
            </CardTitle>
            <CardDescription>Customize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                </div>
                <Select value={profileData.theme} onValueChange={handleThemeChange} disabled={!isEditing}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Receive reminders and updates</p>
                </div>
                <Switch
                  checked={profileData.notifications}
                  onCheckedChange={(checked) => handleInputChange("notifications", checked)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>Your activity and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{user?.entriesCount || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Diary Entries</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{user?.todosCount || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Todo Items</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{user?.streakDays || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
