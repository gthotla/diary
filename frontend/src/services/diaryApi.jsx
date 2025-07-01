import { api } from "./authService"
import dashboardCache from "./dashboardCache"

const diaryApi = {
  // Create a new diary entry
  createEntry: async (entryData) => {
    try {
      const formData = new FormData()

      // Add text fields
      Object.keys(entryData).forEach((key) => {
        if (key !== "images" && entryData[key] !== undefined) {
          formData.append(key, entryData[key])
        }
      })

      // Add images if present
      if (entryData.images && entryData.images.length > 0) {
        entryData.images.forEach((image) => {
          formData.append("images", image)
        })
      }

      const response = await api.post("/api/diary", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },{
        timeout: 10000, // Set timeout to 10 seconds
      })

      if (response.data && response.data.success !== false) {
        // Add to dashboard cache only
        dashboardCache.addEntry(response.data)
      }

      return {
        success: true,
        data: response.data,
        message: "Entry created successfully",
      }
    } catch (error) {
      console.error("Create entry error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create entry",
      }
    }
  },

  // Get all diary entries - always fetch from API
  getAllEntries: async () => {
    try {
      const response = await api.get("/api/diary")
      return {
        success: true,
        data: response.data,
        message: "Entries retrieved successfully",
      }
    } catch (error) {
      console.error("Get entries error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch entries",
      }
    }
  },

  // Get recent entries for dashboard with cache
  getRecentEntries: async () => {
    try {
      // Check cache first
      const cachedEntries = dashboardCache.getRecentEntries()
      if (cachedEntries) {
        return {
          success: true,
          data: cachedEntries,
          message: "Recent entries retrieved from cache",
        }
      }

      // Fetch from API and cache
      const response = await api.get("/api/diary")
      if (response.data) {
        dashboardCache.setRecentEntries(response.data)
        return {
          success: true,
          data: response.data.slice(0, 5),
          message: "Recent entries retrieved successfully",
        }
      }

      return {
        success: false,
        message: "Failed to fetch recent entries",
      }
    } catch (error) {
      console.error("Get recent entries error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch recent entries",
      }
    }
  },

  // Get entry by ID
  getEntryById: async (id) => {
    try {
      const response = await api.get(`/api/diary/${id}`)
      return {
        success: true,
        data: response.data,
        message: "Entry retrieved successfully",
      }
    } catch (error) {
      console.error("Get entry error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch entry",
      }
    }
  },

  // Update diary entry
  updateEntry: async (id, entryData) => {
    try {
      const response = await api.put(`/api/diary/${id}`, entryData)

      if (response.data) {
        // Update dashboard cache only
        dashboardCache.updateEntry(response.data)
      }

      return {
        success: true,
        data: response.data,
        message: "Entry updated successfully",
      }
    } catch (error) {
      console.error("Update entry error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update entry",
      }
    }
  },

  // Delete diary entry
  deleteEntry: async (id) => {
    try {
      const response = await api.delete(`/api/diary/${id}`)

      // Remove from dashboard cache only
      dashboardCache.removeEntry(id)

      return {
        success: true,
        data: response.data,
        message: "Entry deleted successfully",
      }
    } catch (error) {
      console.error("Delete entry error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete entry",
      }
    }
  },

  // Get entries by date range
  getEntriesByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get(`/api/diary/range/date?start=${startDate}&end=${endDate}`)
      return {
        success: true,
        data: response.data,
        message: "Entries retrieved successfully",
      }
    } catch (error) {
      console.error("Get entries by range error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch entries",
      }
    }
  },

  // Get entries by time filter (year, month, day)
  getEntriesByTime: async (type, value) => {
    try {
      const response = await api.get(`/api/diary/time/${type}/${value}`)
      return {
        success: true,
        data: response.data,
        message: "Entries retrieved successfully",
      }
    } catch (error) {
      console.error("Get entries by time error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch entries",
      }
    }
  },
}

export default diaryApi
