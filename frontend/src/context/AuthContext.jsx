"use client"

import { createContext, useContext, useState, useEffect } from "react"
import authService from "../services/authService"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only initialize auth if we're not on the auth page
    if (!window.location.pathname.includes("/auth")) {
      initializeAuth()
    } else {
      setLoading(false)
    }
  }, [])

  const initializeAuth = async () => {
    try {
      // Verify session and get user info using cookies
      const result = await authService.verifyToken()

      if (result.success) {
        setUser(result.user)
      } else {
        // Session is invalid, clear user state
        setUser(null)
      }
    } catch (error) {
      console.error("Auth initialization error:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    setLoading(true)

    try {
      const result = await authService.login(credentials)

      if (result.success) {
        setUser(result.user)
        return { success: true, message: result.message }
      }

      return { success: false, message: result.message }
    } catch (error) {
      return { success: false, message: "Login failed. Please try again." }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)

    try {
      await authService.logout()
    } finally {
      setUser(null)
      setLoading(false)
    }
  }

  const updateUserProfile = async (profileData) => {
    try {
      const result = await authService.updateProfile(profileData)
      if (result.success) {
        setUser(result.user)
        return { success: true, message: "Profile updated successfully" }
      }
      return { success: false, message: result.message }
    } catch (error) {
      return { success: false, message: "Profile update failed. Please try again." }
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateUserProfile,
    updateUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
