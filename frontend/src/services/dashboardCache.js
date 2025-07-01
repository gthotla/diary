// Simple cache service only for dashboard recent entries
const DASHBOARD_CACHE_KEY = "dashboard_recent_entries"
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

class DashboardCache {
  setRecentEntries(entries) {
    try {
      const cacheData = {
        entries: entries.slice(0, 5), // Only store 5 recent entries
        timestamp: Date.now(),
      }
      localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.error("Error caching recent entries:", error)
    }
  }

  getRecentEntries() {
    try {
      const cached = localStorage.getItem(DASHBOARD_CACHE_KEY)
      if (!cached) return null

      const cacheData = JSON.parse(cached)
      const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION

      if (isExpired) {
        localStorage.removeItem(DASHBOARD_CACHE_KEY)
        return null
      }

      return cacheData.entries
    } catch (error) {
      console.error("Error getting cached entries:", error)
      return null
    }
  }

  updateEntry(updatedEntry) {
    const cached = this.getRecentEntries()
    if (cached) {
      const index = cached.findIndex((entry) => entry._id === updatedEntry._id)
      if (index !== -1) {
        cached[index] = updatedEntry
        this.setRecentEntries(cached)
      }
    }
  }

  addEntry(newEntry) {
    const cached = this.getRecentEntries() || []
    cached.unshift(newEntry)
    this.setRecentEntries(cached)
  }

  removeEntry(entryId) {
    const cached = this.getRecentEntries()
    if (cached) {
      const filtered = cached.filter((entry) => entry._id !== entryId)
      this.setRecentEntries(filtered)
    }
  }

  getUserProfile() {
    try {
      const userData = localStorage.getItem("user_data")
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error("Error getting user profile:", error)
      return null
    }
  }

  setUserProfile(user) {
    try {
      localStorage.setItem("user_data", JSON.stringify(user))
    } catch (error) {
      console.error("Error setting user profile:", error)
    }
  }

  clearCache() {
    try {
      localStorage.removeItem(DASHBOARD_CACHE_KEY)
      localStorage.removeItem("user_data")
      console.log("🧹 All cache cleared")
    } catch (error) {
      console.error("Error clearing cache:", error)
    }
  }
}

const dashboardCache = new DashboardCache()
export default dashboardCache
