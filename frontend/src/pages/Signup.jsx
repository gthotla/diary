"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import authService from "../services/authService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, ArrowRight, Camera } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const STEPS = [
  { id: 1, title: "Account Details", description: "Create your account" },
  { id: 2, title: "Profile Setup", description: "Complete your profile" },
  { id: 3, title: "Welcome", description: "You're all set!" },
]

export default function Signup({ onLoginClick }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState("")

  const [formData, setFormData] = useState({
    // Step 1 - Account Details
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2 - Profile Setup
    name: "",
    bio: "",
    avatar: null,
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (error) setError("")
    if (success) setSuccess("")
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
      handleInputChange("avatar", file)

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
    setProfileImagePreview("")
    handleInputChange("avatar", null)
  }

  const validateStep1 = () => {
    if (!formData.username.trim()) {
      setError("Username is required")
      return false
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters")
      return false
    }

    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (!formData.password.trim()) {
      setError("Password is required")
      return false
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    return true
  }

  const validateStep2 = () => {
    if (!formData.name.trim()) {
      setError("Full name is required")
      return false
    }

    if (formData.name.length < 2) {
      setError("Name must be at least 2 characters")
      return false
    }

    return true
  }

  const handleNext = () => {
    setError("")

    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    setError("")
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append("username", formData.username.trim())
      submitData.append("email", formData.email.trim())
      submitData.append("password", formData.password)
      submitData.append("name", formData.name.trim())

      if (formData.bio.trim()) {
        submitData.append("bio", formData.bio.trim())
      }

      if (profileImage) {
        submitData.append("avatar", profileImage)
      }

      const result = await authService.register(submitData)

      if (result.success) {
        setCurrentStep(3)
        setSuccess("Account created successfully!")
        setTimeout(() => {
          onLoginClick()
        }, 2000)
      } else {
        setError(result.message || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const progressPercentage = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-primary/10 to-background items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Start Your Journey</h2>
          <p className="text-muted-foreground leading-relaxed">
            Join thousands of people who are already documenting their lives and tracking their personal growth.
          </p>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background/95 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-primary-foreground"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
            </motion.div>
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-muted-foreground mt-2">{STEPS[currentStep - 1].description}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Step {currentStep} of {STEPS.length}
              </span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center space-x-4">
            {STEPS.map((step) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step.id <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id < currentStep ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                {step.id < STEPS.length && (
                  <div
                    className={`w-8 h-0.5 mx-2 transition-colors ${step.id < currentStep ? "bg-primary" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Alerts */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
                </Alert>
              )}

              {/* Step 1: Account Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username" className="text-sm font-medium">
                      Username *
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      disabled={isSubmitting}
                      className="mt-1 h-11"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={isSubmitting}
                      className="mt-1 h-11"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password *
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        disabled={isSubmitting}
                        className="h-11 pr-10"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-11 px-3"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password *
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        disabled={isSubmitting}
                        className="h-11 pr-10"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-11 px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Profile Setup */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Profile Image Upload */}
                  <div className="text-center">
                    <Label className="text-sm font-medium">Profile Picture</Label>
                    <div className="mt-2 flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Avatar className="w-24 h-24 border-4 border-muted">
                          <AvatarImage src={profileImagePreview || "/placeholder.svg"} alt="Profile preview" />
                          <AvatarFallback className="text-2xl">{getInitials(formData.name)}</AvatarFallback>
                        </Avatar>
                        {profileImagePreview && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                            onClick={removeImage}
                          >
                            ×
                          </Button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          disabled={isSubmitting}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <Label htmlFor="avatar-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" asChild>
                            <span>
                              <Camera className="w-4 h-4 mr-2" />
                              {profileImagePreview ? "Change Photo" : "Add Photo"}
                            </span>
                          </Button>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={isSubmitting}
                      className="mt-1 h-11"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium">
                      Bio (Optional)
                    </Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      disabled={isSubmitting}
                      className="mt-1 resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{formData.bio.length}/500 characters</p>
                  </div>
                </div>
              )}

              {/* Step 3: Welcome */}
              {currentStep === 3 && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Welcome to MyDiary!</h3>
                    <p className="text-muted-foreground">
                      Your account has been created successfully. You'll be redirected to login shortly.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 3 && (
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={currentStep === 1 ? onLoginClick : handleBack}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {currentStep === 1 ? "Back to Login" : "Previous"}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        {currentStep === 2 ? "Create Account" : "Next"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Login Link */}
          {currentStep === 1 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button variant="link" onClick={onLoginClick} className="p-0 h-auto font-medium text-primary">
                  Sign in
                </Button>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
