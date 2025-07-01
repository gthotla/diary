import axios from "axios"

// Create axios instance with cookie support
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies in requests
})

// List of public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/landing", "/auth", "/signup", "/login", "/about", "/contact", "/privacy", "/terms"]

// Helper function to check if current route is public
const isPublicRoute = (pathname) => {
  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") {
      return pathname === "/" || pathname === ""
    }
    return pathname.startsWith(route)
  })
}

// Response interceptor to handle 401 - ONLY redirect if on protected routes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const currentPath = window.location.pathname

    // Only redirect to auth if:
    // 1. It's a 401 error
    // 2. User is NOT on a public route
    // 3. User is NOT already on auth page
    if (error.response?.status === 401 && !isPublicRoute(currentPath) && !currentPath.includes("/auth")) {
      console.log("401 error on protected route, clearing auth state")
      localStorage.removeItem("user_data")
      // Don't redirect immediately, let the auth context handle it
    }

    return Promise.reject(error)
  },
)

// Auth service for handling user authentication
const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post("/api/users/login", credentials, {
        timeout: 5000,
      })

      if (response.data.success || response.data.message === "User logged in succesfully") {
        return {
          success: true,
          user: response.data.user,
          message: response.data.message,
        }
      }

      return {
        success: false,
        message: response.data.message || "Login failed",
      }
    } catch (error) {
      console.error("Login error:", error)

      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        return {
          success: false,
          message: "Unable to connect to server. Please check your internet connection and try again.",
          isNetworkError: true,
        }
      }

      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          message: "Request timed out. Please try again.",
          isNetworkError: true,
        }
      }

      if (error.response?.status >= 500) {
        return {
          success: false,
          message: "Server error. Please try again later.",
          isServerError: true,
        }
      }

      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please try again.",
      }
    }
  },

  // Register user - now supports FormData for file uploads
  register: async (userData) => {
    try {
      // Determine if we're sending FormData or regular JSON
      const isFormData = userData instanceof FormData
      const config = {
        timeout: 8000,
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : { "Content-Type": "application/json" },
      }

      const response = await api.post("/api/users/register", userData, config)

      if (response.data.success || response.data.message === "User created succesfully") {
        return {
          success: true,
          user: response.data.user,
          message: response.data.message,
        }
      }

      return {
        success: false,
        message: response.data.message || "Registration failed",
      }
    } catch (error) {
      console.error("Registration error:", error)

      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        return {
          success: false,
          message: "Unable to connect to server. Please check your internet connection and try again.",
          isNetworkError: true,
        }
      }

      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          message: "Request timed out. Please try again.",
          isNetworkError: true,
        }
      }

      if (error.response?.status >= 500) {
        return {
          success: false,
          message: "Server error. Please try again later.",
          isServerError: true,
        }
      }

      return {
        success: false,
        message: error.response?.data?.message || "Registration failed. Please try again.",
      }
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.patch("/api/users/update-profile", profileData, {
        timeout: 5000,
      })

      if (response.data.success) {
        return {
          success: true,
          user: response.data.user,
          message: response.data.message || "Profile updated successfully",
        }
      }

      return {
        success: false,
        message: response.data.message || "Profile update failed",
      }
    } catch (error) {
      console.error("Profile update error:", error)

      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        return {
          success: false,
          message: "Unable to connect to server. Please check your internet connection and try again.",
          isNetworkError: true,
        }
      }

      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          message: "Request timed out. Please try again.",
          isNetworkError: true,
        }
      }

      if (error.response?.status >= 500) {
        return {
          success: false,
          message: "Server error. Please try again later.",
          isServerError: true,
        }
      }

      return {
        success: false,
        message: error.response?.data?.message || "Profile update failed. Please try again.",
      }
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.get("/api/users/logout")
      return { success: true }
    } catch (error) {
      console.error("Logout error:", error)
      return { success: true } // Still return success to clear local state
    }
  },

  // Verify token and get user info
  verifyToken: async () => {
    try {
      const response = await api.get("/api/users/me")

      if (response.data.success) {
        return {
          success: true,
          user: response.data.user,
        }
      }

      return {
        success: false,
        message: response.data.message || "Token verification failed",
      }
    } catch (error) {
      console.error("Verify token error:", error)

      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        return {
          success: false,
          message: "Unable to connect to server",
          isNetworkError: true,
        }
      }

      return {
        success: false,
        message: error.response?.data?.message || "Token verification failed",
      }
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get("/api/users/me")

      if (response.data.success) {
        return {
          success: true,
          user: response.data.user,
        }
      }

      return {
        success: false,
        message: response.data.message || "Failed to get user info",
      }
    } catch (error) {
      console.error("Get current user error:", error)

      if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
        return {
          success: false,
          message: "Unable to connect to server",
          isNetworkError: true,
        }
      }

      return {
        success: false,
        message: error.response?.data?.message || "Failed to get user info",
      }
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const result = await authService.verifyToken()
    return result.success
  },
}

export default authService
export { api }
