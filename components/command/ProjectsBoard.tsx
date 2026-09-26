"use client"

import React, { useState, useMemo } from "react"
import { useApp } from "@/store/AppContext"
import { generateId } from "@/lib/utils"
import { Plus, Check, X } from "lucide-react"
import type { Task, TaskStatus, Priority } from "@/types"

// Helper to capitalize priority for the Task type ("low" -> "Low")
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// Priority badge styles matching the CareReceptionist design spec
const PRIORITY_STYLES: Record<Priority, {bg: string; text: string}> = {
  Low: { bg: "rgba(148, 163, 184, 0.15)", text: "#94a3b8" },
  Medium: { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24" },
  High: { bg: "rgba(244, 63, 94, 0.15)", text: "#f43f5e" },
  Critical: { bg: "rgba(244, 63, 94, 0.15)", text: "#f43f5e" }, // fallback, not used in UI
}

export function ProjectsBoard() {
  const { state, dispatch } = useApp()
  const tasks = state.data.tasks

  // UI state
  const [newText, setNewText] = useState("")
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("low")
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")

  // Filtered task list based on selected tab
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case "active":
        return tasks.filter(t => t.status !== "Completed")
      case "completed":
        return tasks.filter(t => t.status === "Completed")
      default:
        return tasks
    }
  }, [tasks, filter])

  const activeCount = useMemo(() => tasks.filter(t => t.status !== "Completed").length, [tasks])

  const addTask = () => {
    const title = newText.trim()
    if (!title) return
    const id = generateId()
    const now = new Date().toISOString()
    const task: Task = {
      id,
      projectId: null,
      title,
      description: "",
      status: "To-Do" as TaskStatus,
      priority: capitalize(newPriority) as Priority,
      dueDate: null,
      tags: [],
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    }
    dispatch({ type: "ADD_TASK", payload: task })
    setNewText("")
    setNewPriority("low")
  }

  const toggleComplete = (task: Task) => {
    const isCompleted = task.status === "Completed"
    const updated: Task = {
      ...task,
      status: isCompleted ? "To-Do" : "Completed",
      updatedAt: new Date().toISOString(),
      completedAt: isCompleted ? null : new Date().toISOString(),
    }
    dispatch({ type: "UPDATE_TASK", payload: updated })
  }

  const deleteTask = (id: string) => {
    dispatch({ type: "DELETE_TASK", payload: id })
  }

  const clearCompleted = () => {
    tasks.filter(t => t.status === "Completed").forEach(t => deleteTask(t.id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTask()
    }
  }

  return (
    <div className="text-[#f3f4f6]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Todo List</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded ${filter === "all" ? "bg-[#131926]" : "bg-transparent"}`}
          >All</button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1 rounded ${filter === "active" ? "bg-[#131926]" : "bg-transparent"}`}
          >Active</button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1 rounded ${filter === "completed" ? "bg-[#131926]" : "bg-transparent"}`}
          >Completed</button>
        </div>
      </div>

      {/* Counter and clear */}
      <div className="flex items-center justify-between mb-2 text-sm text-[#9ca3af]">
        <span>{activeCount} item{activeCount !== 1 ? "s" : ""} left</span>
        {tasks.some(t => t.status === "Completed") && (
          <button onClick={clearCompleted} className="text-[#06b6d4] hover:underline">Clear completed</button>
        )}
      </div>

      {/* Add task input */}
      <div className="flex gap-2 mb-4">
        <select
          value={newPriority}
          onChange={e => setNewPriority(e.target.value as any)}
          className="px-2 py-1 rounded bg-[#131926] border border-[#1f293d] text-[#f3f4f6] focus:outline-none"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 rounded bg-[#131926] border border-[#1f293d] text-[#f3f4f6] focus:outline-none"
        />
        <button
          onClick={addTask}
          className="flex items-center gap-1 px-3 py-2 bg-[#06b6d4] text-white rounded hover:opacity-90 disabled:opacity-40"
          disabled={!newText.trim()}
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Task list */}
      <ul className="space-y-2">
        {filteredTasks.map(task => (
          <li
            key={task.id}
            className="flex items-center justify-between p-3 bg-[#131926] border border-[#1f293d] rounded hover:bg-[#182030]"
          >
            <div className="flex items-center gap-3">
              <button onClick={() => toggleComplete(task)} className="focus:outline-none">
                {task.status === "Completed" ? (
                  <Check size={18} className="text-[#06b6d4]" />
                ) : (
                  <div className="w-4 h-4 border border-[#9ca3af] rounded-sm" />
                )}
              </button>
              <span className={task.status === "Completed" ? "line-through text-[#9ca3af]" : ""}>
                {task.title}
              </span>
              <span
                className="px-2 py-0.5 rounded text-xs"
                style={{
                  background: PRIORITY_STYLES[task.priority as Priority].bg,
                  color: PRIORITY_STYLES[task.priority as Priority].text,
                }}
              >
                {task.priority}
              </span>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 hover:opacity-100 transition-opacity text-[#9ca3af] hover:text-red-500"
            >
              <X size={16} />
            </button>
          </li>
        ))}
        {filteredTasks.length === 0 && (
          <li className="text-center text-[#9ca3af] py-4">No tasks to display.</li>
        )}
      </ul>
    </div>
  )
}
