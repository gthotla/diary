"use client"

import { createContext, useContext, useState, useEffect } from "react"
import authService from "../services/authService"
import dashboardCache from "../services/dashboardCache"

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
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      console.log("🔄 Initializing auth...")

      // Check cache first for faster loading
      const cachedUser = dashboardCache.getUserProfile?.() || localStorage.getItem("user_data")
      if (cachedUser) {
        try {
          const userData = typeof cachedUser === "string" ? JSON.parse(cachedUser) : cachedUser
          console.log("📦 Loading user from cache")
          setUser(userData)
        } catch (error) {
          console.error("❌ Error parsing cached user:", error)
          localStorage.removeItem("user_data")
        }
      }

      // Always verify with server
      const result = await authService.verifyToken()

      if (result.success) {
        setUser(result.user)
        localStorage.setItem("user_data", JSON.stringify(result.user))
        console.log("✅ User authenticated and cached")
      } else {
        console.log("❌ Session verification failed")
        setUser(null)
        localStorage.removeItem("user_data")

        const currentPath = window.location.pathname
        const publicRoutes = ["/", "/auth", "/login", "/signup"]
        const isPublicRoute = publicRoutes.some((route) =>
          route === "/" ? currentPath === "/" : currentPath.startsWith(route),
        )

        if (!isPublicRoute) {
          console.log("🔄 Redirecting to auth from protected route")
          window.location.href = "/auth"
        }
      }
    } catch (error) {
      console.error("❌ Auth initialization error:", error)
      setUser(null)
      localStorage.removeItem("user_data")

      const currentPath = window.location.pathname
      const publicRoutes = ["/", "/auth", "/login", "/signup"]
      const isPublicRoute = publicRoutes.some((route) =>
        route === "/" ? currentPath === "/" : currentPath.startsWith(route),
      )

      if (!isPublicRoute) {
        console.log("🔄 Redirecting to auth due to error")
        window.location.href = "/auth"
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    setLoading(true)

    try {
      console.log("🔐 Attempting login...")
      const result = await authService.login(credentials)

      if (result.success) {
        setUser(result.user)
        localStorage.setItem("user_data", JSON.stringify(result.user))
        console.log("✅ Login successful, user cached")
        return { success: true, message: result.message }
      }

      console.error("❌ Login failed:", result.message)
      return { success: false, message: result.message }
    } catch (error) {
      console.error("❌ Login error:", error)
      return { success: false, message: "Login failed. Please try again." }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)

    try {
      console.log("🚪 Logging out...")
      await authService.logout()
      console.log("✅ Logout API call completed")
    } catch (error) {
      console.error("❌ Logout API error:", error)
    } finally {
      setUser(null)
      localStorage.removeItem("user_data")
      dashboardCache.clearCache?.()
      console.log("🧹 User state and cache cleared")
      setLoading(false)
    }
  }

  const updateUserProfile = async (profileData) => {
    try {
      const result = await authService.updateProfile(profileData)
      if (result.success) {
        setUser(result.user)
        localStorage.setItem("user_data", JSON.stringify(result.user))
        return { success: true, message: "Profile updated successfully" }
      }
      return { success: false, message: result.message }
    } catch (error) {
      return { success: false, message: "Profile update failed. Please try again." }
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem("user_data", JSON.stringify(userData))
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
