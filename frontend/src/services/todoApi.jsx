import { api } from "./authService"

const todoApi = {
  // Create a new todo
  createTodo: async (todoData) => {
    try {
      const response = await api.post("/api/todos", todoData)
      return {
        success: true,
        data: response.data,
        message: "Todo created successfully",
      }
    } catch (error) {
      console.error("Create todo error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create todo",
      }
    }
  },

  // Get all todos - always fetch from API
  getAllTodos: async () => {
    try {
      const response = await api.get("/api/todos")
      return {
        success: true,
        data: response.data,
        message: "Todos retrieved successfully",
      }
    } catch (error) {
      console.error("Get todos error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch todos",
      }
    }
  },

  // Get todo by ID
  getTodoById: async (id) => {
    try {
      const response = await api.get(`/api/todos/${id}`)
      return {
        success: true,
        data: response.data,
        message: "Todo retrieved successfully",
      }
    } catch (error) {
      console.error("Get todo error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch todo",
      }
    }
  },

  // Update todo
  updateTodo: async (id, todoData) => {
    try {
      const response = await api.put(`/api/todos/${id}`, todoData)
      return {
        success: true,
        data: response.data,
        message: "Todo updated successfully",
      }
    } catch (error) {
      console.error("Update todo error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update todo",
      }
    }
  },

  // Delete todo
  deleteTodo: async (id) => {
    try {
      const response = await api.delete(`/api/todos/${id}`)
      return {
        success: true,
        data: response.data,
        message: "Todo deleted successfully",
      }
    } catch (error) {
      console.error("Delete todo error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete todo",
      }
    }
  },

  // Toggle todo status using new API endpoint
  toggleTodoStatus: async (id, status) => {
    try {
      const response = await api.patch(`/api/todos/${id}/status/${status}`)
      return {
        success: true,
        data: response.data,
        message: "Todo status updated successfully",
      }
    } catch (error) {
      console.error("Toggle todo status error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update todo status",
      }
    }
  },

  // Get todos by priority
  getTodosByPriority: async (priority) => {
    try {
      const response = await api.get(`/api/todos/priority/${priority}`)
      return {
        success: true,
        data: response.data,
        message: "Todos retrieved successfully",
      }
    } catch (error) {
      console.error("Get todos by priority error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch todos",
      }
    }
  },
}

export default todoApi
