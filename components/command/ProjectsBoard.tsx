"use client"

import React, { useState, useEffect } from "react"
import { useApp } from "@/store/AppContext"
import type { Task, TaskStatus, Project, Priority } from "@/types"
import { Plus, Trash2, Edit, Calendar, Tag, X } from "lucide-react"
import { generateId } from "@/lib/utils"

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "Backlog", label: "Backlog" },
  { status: "To-Do", label: "To-Do" },
  { status: "In Progress", label: "In Progress" },
  { status: "On Hold", label: "On Hold" },
  { status: "Completed", label: "Completed" },
]

const PRIORITY_COLORS: Record<Priority, string> = {
  Low: "bg-green-500",
  Medium: "bg-yellow-500",
  High: "bg-orange-500",
  Critical: "bg-red-500",
}

export function ProjectsBoard() {
  const { state, dispatch } = useApp()
  const { tasks, projects } = state.data

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectFormData, setProjectFormData] = useState({
    name: "",
    description: "",
    status: "Active" as Project["status"],
    color: "#6366f1",
  })
  const [detailTask, setDetailTask] = useState<Task | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Backlog" as TaskStatus,
    priority: "Medium" as Priority,
    dueDate: "",
    projectId: "",
    tags: "",
  })

  const filteredTasks = activeProjectId
    ? tasks.filter(t => t.projectId === activeProjectId)
    : tasks

  const tasksByStatus = COLUMNS.reduce(
    (acc, col) => {
      acc[col.status] = filteredTasks.filter(t => t.status === col.status)
      return acc
    },
    {} as Record<TaskStatus, Task[]>
  )

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate || "",
        projectId: editingTask.projectId || "",
        tags: editingTask.tags.join(", "),
      })
    } else {
      setFormData({
        title: "",
        description: "",
        status: "Backlog",
        priority: "Medium",
        dueDate: "",
        projectId: activeProjectId || "",
        tags: "",
      })
    }
  }, [editingTask, activeProjectId])

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    dispatch({ type: "MOVE_TASK", payload: { taskId, status: newStatus } })
  }

  const handleAddTask = () => {
    setEditingTask(null)
    setShowTaskModal(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Delete this task?")) {
      dispatch({ type: "DELETE_TASK", payload: taskId })
    }
  }

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    const now = new Date().toISOString()
    const tags = formData.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean)

    if (editingTask) {
      const updated: Task = {
        ...editingTask,
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        projectId: formData.projectId || null,
        tags,
        updatedAt: now,
      }
      dispatch({ type: "UPDATE_TASK", payload: updated })
    } else {
      const newTask: Task = {
        id: generateId(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        projectId: formData.projectId || null,
        tags,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
      }
      dispatch({ type: "ADD_TASK", payload: newTask })
    }

    setShowTaskModal(false)
    setEditingTask(null)
  }

  const handleCancel = () => {
    setShowTaskModal(false)
    setEditingTask(null)
  }

  const handleManageProjects = () => {
    setEditingProject(null)
    setProjectFormData({ name: "", description: "", status: "Active", color: "#6366f1" })
    setShowProjectModal(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setProjectFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      color: project.color,
    })
    setShowProjectModal(true)
  }

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectFormData.name.trim()) return

    const now = new Date().toISOString()

    if (editingProject) {
      const updated: Project = {
        ...editingProject,
        name: projectFormData.name.trim(),
        description: projectFormData.description.trim(),
        status: projectFormData.status,
        color: projectFormData.color,
        updatedAt: now,
      }
      dispatch({ type: "UPDATE_PROJECT", payload: updated })
    } else {
      const newProject: Project = {
        id: generateId(),
        name: projectFormData.name.trim(),
        description: projectFormData.description.trim(),
        status: projectFormData.status,
        color: projectFormData.color,
        createdAt: now,
        updatedAt: now,
      }
      dispatch({ type: "ADD_PROJECT", payload: newProject })
    }

    setShowProjectModal(false)
    setEditingProject(null)
  }

  const handleDeleteProject = (projectId: string) => {
    if (confirm("Delete this project and unassign its tasks?")) {
      dispatch({ type: "DELETE_PROJECT", payload: projectId })
    }
  }

  const handleViewDetail = (task: Task) => {
    setDetailTask(task)
  }

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    dispatch({ type: "MOVE_TASK", payload: { taskId: task.id, status: newStatus } })
    setDetailTask(null)
  }

  const EMPTY_STATE: Record<TaskStatus, string> = {
    Backlog: "Nothing queued yet — drag a task here or add one.",
    "To-Do": "No tasks to do. Pull from Backlog or add one.",
    "In Progress": "No active work. Start a task to see it here.",
    "On Hold": "No paused tasks. Move one here when you need to wait.",
    Completed: "No completed tasks yet. Finish one to celebrate.",
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">Projects Board</h2>
        <div className="flex items-center gap-2">
          <select
            value={activeProjectId || ""}
            onChange={e => setActiveProjectId(e.target.value || null)}
            className="px-3 py-1.5 text-sm bg-card border border-border rounded-lg text-foreground"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleManageProjects}
            className="px-3 py-1.5 text-sm bg-card border border-border rounded-lg hover:bg-muted flex items-center gap-1.5"
            title="Manage Projects"
          >
            Manage
          </button>
          <button
            onClick={handleAddTask}
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 min-w-max h-full">
          {COLUMNS.map(({ status, label }) => (
            <div
              key={status}
              className="flex-1 min-w-[280px] max-w-[320px] bg-card rounded-xl border border-border flex flex-col"
            >
              {/* Column Header */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="font-medium text-foreground">{label}</h3>
                <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                  {tasksByStatus[status]?.length || 0}
                </span>
              </div>

              {/* Task Cards */}
              <div
                className="flex-1 overflow-y-auto p-3 space-y-3"
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault()
                  const taskId = e.dataTransfer.getData("text/plain")
                  if (taskId) handleMoveTask(taskId, status)
                }}
              >
                {tasksByStatus[status]?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                    <p className="text-sm text-muted-foreground">{EMPTY_STATE[status]}</p>
                  </div>
                ) : (
                  tasksByStatus[status]?.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={e => e.dataTransfer.setData("text/plain", task.id)}
                      onClick={() => handleViewDetail(task)}
                      className="bg-background border border-border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <span
                              className={`px-1.5 py-0.5 rounded ${PRIORITY_COLORS[task.priority]} text-white`}
                            >
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            {task.tags.length > 0 && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Tag className="w-3 h-3" />
                                {task.tags.slice(0, 2).join(", ")}
                                {task.tags.length > 2 && ` +${task.tags.length - 2}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); handleEditTask(task) }}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteTask(task.id) }}
                            className="p-1.5 text-muted-foreground hover:text-red-500 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Modal Placeholder */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingTask ? "Edit Task" : "New Task"}</h3>
              <button
                onClick={handleCancel}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What needs to be done?"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add details..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {COLUMNS.map(c => (
                      <option key={c.status} value={c.status}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Project</label>
                  <select
                    value={formData.projectId}
                    onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">No project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="comma-separated"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  {editingTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingProject ? "Edit Project" : "New Project"}</h3>
              <button
                onClick={() => setShowProjectModal(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  type="text"
                  value={projectFormData.name}
                  onChange={e => setProjectFormData({ ...projectFormData, name: e.target.value })}
                  placeholder="Project name"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={projectFormData.description}
                  onChange={e => setProjectFormData({ ...projectFormData, description: e.target.value })}
                  placeholder="Add details..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Status</label>
                  <select
                    value={projectFormData.status}
                    onChange={e => setProjectFormData({ ...projectFormData, status: e.target.value as Project["status"] })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Color</label>
                  <input
                    type="color"
                    value={projectFormData.color}
                    onChange={e => setProjectFormData({ ...projectFormData, color: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-10 cursor-pointer"
                  />
                </div>
              </div>

              {editingProject && (
                <div className="pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(editingProject.id)}
                    className="w-full px-4 py-2 text-sm text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/10 flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Project
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  {editingProject ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>

            {/* Existing Projects List */}
            {projects.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2">Existing Projects</h4>
                <div className="space-y-2">
                  {projects.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background border border-border"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-sm truncate">{p.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{p.status}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditProject(p)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Detail Drawer */}
      {detailTask && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <div
            className="bg-card border-l border-border w-full max-w-md h-full flex flex-col animate-in slide-in-from-right duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold truncate">Task Details</h3>
              <button
                onClick={() => setDetailTask(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h4 className="text-base font-medium text-foreground">{detailTask.title}</h4>
                {detailTask.description && (
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                    {detailTask.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <select
                    value={detailTask.status}
                    onChange={e => handleStatusChange(detailTask, e.target.value as TaskStatus)}
                    className="w-full mt-1 px-2 py-1.5 text-sm bg-background border border-border rounded-lg text-foreground"
                  >
                    {COLUMNS.map(c => (
                      <option key={c.status} value={c.status}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs text-white ${PRIORITY_COLORS[detailTask.priority]}`}
                    >
                      {detailTask.priority}
                    </span>
                  </div>
                </div>
              </div>

              {detailTask.dueDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Due</span>
                  <span className="text-foreground">
                    {new Date(detailTask.dueDate).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                </div>
              )}

              {detailTask.projectId && (() => {
                const project = projects.find(p => p.id === detailTask.projectId)
                return project ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                    <span className="text-muted-foreground">Project</span>
                    <span className="text-foreground">{project.name}</span>
                  </div>
                ) : null
              })()}

              {detailTask.tags.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex flex-wrap gap-1.5">
                    {detailTask.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                <div>Created: {new Date(detailTask.createdAt).toLocaleString()}</div>
                <div>Updated: {new Date(detailTask.updatedAt).toLocaleString()}</div>
                {detailTask.completedAt && (
                  <div>Completed: {new Date(detailTask.completedAt).toLocaleString()}</div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border flex gap-2">
              <button
                onClick={() => {
                  setDetailTask(null)
                  handleEditTask(detailTask)
                }}
                className="flex-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                Edit Task
              </button>
              <button
                onClick={() => {
                  const id = detailTask.id
                  setDetailTask(null)
                  handleDeleteTask(id)
                }}
                className="px-4 py-2 text-sm text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/10"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}