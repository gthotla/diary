"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import {
  CalendarIcon,
  Plus,
  Edit,
  Trash2,
  Check,
  Clock,
  AlertCircle,
  Loader2,
  Play,
  GripVertical,
  RotateCcw,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import todoApi from "../services/todoApi"

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  medium:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  high: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
}

const PRIORITY_ICONS = {
  low: Clock,
  medium: AlertCircle,
  high: AlertCircle,
}

const STATUS_TRANSITIONS = {
  todo: { next: "in-progress", icon: Play, label: "Start" },
  "in-progress": { next: "done", icon: Check, label: "Complete" },
  done: { next: "todo", icon: RotateCcw, label: "Restart" },
}

export default function TodoKanban() {
  const [todos, setTodos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dueDate, setDueDate] = useState(null)
  const [draggedTodo, setDraggedTodo] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  const [formData, setFormData] = useState({
    task: "",
    description: "",
    priority: "medium",
    dueDate: "",
    status: "todo",
  })

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    setIsLoading(true)
    setError("")

    try {
      const result = await todoApi.getAllTodos()

      if (result.success) {
        setTodos(result.data)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to fetch todos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDateSelect = (date) => {
    setDueDate(date)
    handleInputChange("dueDate", date ? date.toISOString() : "")
  }

  const resetForm = () => {
    setFormData({
      task: "",
      description: "",
      priority: "medium",
      dueDate: "",
      status: "todo",
    })
    setDueDate(null)
    setEditingTodo(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    if (!formData.task.trim()) {
      setError("Task name is required")
      setIsSubmitting(false)
      return
    }

    try {
      let result
      if (editingTodo) {
        result = await todoApi.updateTodo(editingTodo._id, formData)
      } else {
        result = await todoApi.createTodo(formData)
      }

      if (result.success) {
        await fetchTodos()
        setIsDialogOpen(false)
        resetForm()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to save todo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (todo) => {
    setEditingTodo(todo)
    setFormData({
      task: todo.task,
      description: todo.description || "",
      priority: todo.priority,
      dueDate: todo.dueDate || "",
      status: todo.status || "todo",
    })
    if (todo.dueDate) {
      setDueDate(new Date(todo.dueDate))
    }
    setIsDialogOpen(true)
  }

  const handleStatusToggle = async (todoId, currentStatus) => {
    const transition = STATUS_TRANSITIONS[currentStatus]
    if (!transition) return

    try {
      const result = await todoApi.toggleTodoStatus(todoId, transition.next)

      if (result.success) {
        await fetchTodos()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to update todo status")
    }
  }

  const handleStatusChange = async (todoId, newStatus) => {
    try {
      const result = await todoApi.toggleTodoStatus(todoId, newStatus)

      if (result.success) {
        await fetchTodos()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to update todo status")
    }
  }

  const handleDelete = async (todoId) => {
    if (!window.confirm("Are you sure you want to delete this todo?")) {
      return
    }

    try {
      const result = await todoApi.deleteTodo(todoId)

      if (result.success) {
        setTodos((prev) => prev.filter((todo) => todo._id !== todoId))
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to delete todo")
    }
  }

  const openNewTodoDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  // Drag and drop handlers
  const handleDragStart = (e, todo) => {
    setDraggedTodo(todo)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", e.target.outerHTML)
  }

  const handleDragEnd = () => {
    setDraggedTodo(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragEnter = (e, columnId) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (draggedTodo && draggedTodo.status !== newStatus) {
      await handleStatusChange(draggedTodo._id, newStatus)
    }
    setDraggedTodo(null)
  }

  // Group todos by status
  const todoColumns = {
    todo: todos.filter((todo) => todo.status === "todo" || (!todo.status && !todo.completed)),
    "in-progress": todos.filter((todo) => todo.status === "in-progress"),
    done: todos.filter((todo) => todo.status === "done" || todo.completed),
  }

  // Calculate dynamic column widths
  const getColumnWidth = (columnId) => {
    const count = todoColumns[columnId].length
    if (count === 0) {
      return "md:col-span-1" // Smaller width for empty columns
    }
    return "md:col-span-2" // Normal width for columns with content
  }

  const columnConfig = {
    todo: {
      title: "To Do",
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    "in-progress": {
      title: "In Progress",
      icon: Play,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    done: {
      title: "Done",
      icon: Check,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
    },
  }

  const TodoCard = ({ todo, columnId }) => {
    const PriorityIcon = PRIORITY_ICONS[todo.priority]
    const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== "done"
    const transition = STATUS_TRANSITIONS[todo.status || "todo"]

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        draggable
        onDragStart={(e) => handleDragStart(e, todo)}
        onDragEnd={handleDragEnd}
        className="cursor-move"
      >
        <Card
          className={cn(
            "mb-3 transition-all hover:shadow-md group border-2",
            isOverdue && "border-red-300 bg-red-50 dark:bg-red-950/30",
            draggedTodo?._id === todo._id && "opacity-50 rotate-2 scale-105",
            !isOverdue && "border-muted",
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <GripVertical className="w-3 h-3 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                  <h4 className="font-medium text-sm leading-tight">{todo.task}</h4>
                </div>
                {todo.description && (
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{todo.description}</p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(todo)} className="h-6 w-6 p-0">
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(todo._id)}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <Badge className={PRIORITY_COLORS[todo.priority]} variant="outline">
                <PriorityIcon className="w-3 h-3 mr-1" />
                {todo.priority}
              </Badge>

              {todo.dueDate && (
                <span className={cn("text-xs", isOverdue ? "text-red-600 font-medium" : "text-muted-foreground")}>
                  {format(new Date(todo.dueDate), "MMM d")}
                </span>
              )}
            </div>

            {/* Status Toggle Button */}
            {transition && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusToggle(todo._id, todo.status || "todo")}
                className="w-full h-8 text-xs flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <transition.icon className="w-3 h-3" />
                {transition.label}
                <ArrowRight className="w-3 h-3 ml-auto" />
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Todo Board</h2>
          <p className="text-muted-foreground">Drag tasks between columns or use the action buttons</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewTodoDialog}>
              <Plus className="w-4 h-4 mr-2" />
              New Todo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTodo ? "Edit Todo" : "Create New Todo"}</DialogTitle>
              <DialogDescription>
                {editingTodo ? "Update your todo item" : "Add a new task to your list"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="task">Task *</Label>
                <Input
                  id="task"
                  value={formData.task}
                  onChange={(e) => handleInputChange("task", e.target.value)}
                  placeholder="What needs to be done?"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Add more details..."
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange("priority", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground",
                        )}
                        disabled={isSubmitting}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingTodo ? "Updating..." : "Creating..."}
                    </>
                  ) : editingTodo ? (
                    "Update Todo"
                  ) : (
                    "Create Todo"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {Object.entries(columnConfig).map(([columnId, config]) => (
          <motion.div
            key={columnId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Object.keys(columnConfig).indexOf(columnId) * 0.1 }}
            className={getColumnWidth(columnId)}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, columnId)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, columnId)}
          >
            <Card
              className={cn(
                config.bgColor,
                "transition-all duration-200",
                dragOverColumn === columnId && "ring-2 ring-primary ring-offset-2 scale-105",
                dragOverColumn === columnId && config.borderColor,
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <config.icon className={`w-5 h-5 ${config.color}`} />
                  {config.title}
                  <Badge variant="secondary">{todoColumns[columnId].length}</Badge>
                </CardTitle>
                <CardDescription>
                  {columnId === "todo" && "Tasks to be started"}
                  {columnId === "in-progress" && "Tasks currently being worked on"}
                  {columnId === "done" && "Completed tasks"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {todoColumns[columnId].length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "text-center py-8 text-muted-foreground transition-all duration-200 rounded-lg border-2 border-dashed",
                        dragOverColumn === columnId ? "border-primary bg-primary/5 text-primary" : "border-muted",
                      )}
                    >
                      <config.icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {dragOverColumn === columnId
                          ? "Drop task here"
                          : columnId === "todo"
                            ? "No pending tasks"
                            : columnId === "in-progress"
                              ? "No tasks in progress"
                              : "No completed tasks yet"}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      {todoColumns[columnId].map((todo) => (
                        <TodoCard key={todo._id} todo={todo} columnId={columnId} />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
