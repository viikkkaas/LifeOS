"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { getToday, generateId } from "@/lib/utils"
import { Phone, MessageSquare, Monitor, DoorOpen, Video, Plus, Minus, Trash2, ChevronLeft, ChevronRight, Save, Pencil, X } from "lucide-react"
import type { DailyGoal } from "@/types"

const METRICS = [
  { key: "coldCalls" as const, label: "Cold Calls Made", icon: Phone, color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "conversations" as const, label: "Conversations", icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "demos" as const, label: "Demos", icon: Monitor, color: "text-purple-400", bg: "bg-purple-500/10" },
  { key: "gatekeepersPassed" as const, label: "Gatekeepers Passed", icon: DoorOpen, color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "shows" as const, label: "Shows (Google Meet)", icon: Video, color: "text-rose-400", bg: "bg-rose-500/10" },
]

export default function DailyGoalsPage() {
  const { state, dispatch } = useApp()
  const { dailyGoals } = state.data
  const today = getToday()

  // Find today's entry or start fresh
  const todayEntry = dailyGoals.find(dg => dg.date === today)

  const [editId, setEditId] = useState<string | null>(todayEntry?.id ?? null)
  const [form, setForm] = useState<Omit<DailyGoal, "id" | "createdAt">>({
    date: today,
    coldCalls: todayEntry?.coldCalls ?? 0,
    conversations: todayEntry?.conversations ?? 0,
    demos: todayEntry?.demos ?? 0,
    gatekeepersPassed: todayEntry?.gatekeepersPassed ?? 0,
    shows: todayEntry?.shows ?? 0,
    notes: todayEntry?.notes ?? "",
  })
  const [selectedDate, setSelectedDate] = useState(today)
  const [showHistory, setShowHistory] = useState(false)

  const selectedEntry = dailyGoals.find(dg => dg.date === selectedDate)
  const isToday = selectedDate === today

  const updateField = (key: keyof typeof form, value: number | string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const increment = (key: keyof typeof form) => {
    setForm(prev => ({ ...prev, [key]: typeof prev[key] === "number" ? (prev[key] as number) + 1 : prev[key] }))
  }

  const decrement = (key: keyof typeof form) => {
    setForm(prev => ({ ...prev, [key]: typeof prev[key] === "number" ? Math.max(0, (prev[key] as number) - 1) : prev[key] }))
  }

  const resetForm = () => {
    setForm({
      date: today,
      coldCalls: 0,
      conversations: 0,
      demos: 0,
      gatekeepersPassed: 0,
      shows: 0,
      notes: "",
    })
    setEditId(null)
  }

  const handleSave = () => {
    if (editId) {
      // Update existing
      dispatch({
        type: "UPDATE_DAILY_GOAL",
        payload: { ...form, id: editId, createdAt: dailyGoals.find(dg => dg.id === editId)?.createdAt ?? new Date().toISOString() } as DailyGoal,
      })
    } else {
      // Add new
      dispatch({
        type: "ADD_DAILY_GOAL",
        payload: { ...form, id: generateId(), createdAt: new Date().toISOString() } as DailyGoal,
      })
      setEditId(todayEntry?.id ?? null)
    }
  }

  const handleEditDate = (date: string) => {
    const entry = dailyGoals.find(dg => dg.date === date)
    if (entry) {
      setForm({
        date: entry.date,
        coldCalls: entry.coldCalls,
        conversations: entry.conversations,
        demos: entry.demos,
        gatekeepersPassed: entry.gatekeepersPassed,
        shows: entry.shows,
        notes: entry.notes,
      })
      setEditId(entry.id)
      setSelectedDate(date)
    }
  }

  const handleDelete = (id: string) => {
    dispatch({ type: "DELETE_DAILY_GOAL", payload: id })
    if (editId === id) resetForm()
  }

  // Weekly stats
  const weekStats = useMemo(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const weekEntries = dailyGoals.filter(dg => {
      const d = new Date(dg.date)
      return d >= startOfWeek && d <= now
    })
    return {
      coldCalls: weekEntries.reduce((s, e) => s + e.coldCalls, 0),
      conversations: weekEntries.reduce((s, e) => s + e.conversations, 0),
      demos: weekEntries.reduce((s, e) => s + e.demos, 0),
      gatekeepersPassed: weekEntries.reduce((s, e) => s + e.gatekeepersPassed, 0),
      shows: weekEntries.reduce((s, e) => s + e.shows, 0),
      days: weekEntries.length,
    }
  }, [dailyGoals])

  // Sorted history (latest first)
  const sortedHistory = useMemo(() => {
    return [...dailyGoals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [dailyGoals])

  const navigateDate = (direction: -1 | 1) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + direction)
    const dateStr = d.toISOString().split("T")[0]
    setSelectedDate(dateStr)
    if (dateStr !== today) {
      const entry = dailyGoals.find(dg => dg.date === dateStr)
      if (entry) {
        setForm({
          date: entry.date,
          coldCalls: entry.coldCalls,
          conversations: entry.conversations,
          demos: entry.demos,
          gatekeepersPassed: entry.gatekeepersPassed,
          shows: entry.shows,
          notes: entry.notes,
        })
        setEditId(entry.id)
      } else {
        setForm({ date: dateStr, coldCalls: 0, conversations: 0, demos: 0, gatekeepersPassed: 0, shows: 0, notes: "" })
        setEditId(null)
      }
    } else {
      resetForm()
      if (todayEntry) {
        setForm({
          date: today,
          coldCalls: todayEntry.coldCalls,
          conversations: todayEntry.conversations,
          demos: todayEntry.demos,
          gatekeepersPassed: todayEntry.gatekeepersPassed,
          shows: todayEntry.shows,
          notes: todayEntry.notes,
        })
        setEditId(todayEntry.id)
      }
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00")
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Daily Goals</h1>
                <p className="text-white/40 text-sm mt-1">Track your cold call performance every day</p>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
              >
                {showHistory ? "Show Form" : "View History"}
              </button>
            </div>

            {!showHistory ? (
              <>
                {/* Date Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateDate(-1)}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className={`text-sm font-medium min-w-[160px] text-center ${isToday ? "text-purple-400" : "text-white/60"}`}>
                      {isToday ? "Today" : formatDate(selectedDate)}
                      {isToday && <span className="text-white/30 ml-1">· {formatDate(selectedDate)}</span>}
                    </span>
                    <button
                      onClick={() => navigateDate(1)}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors disabled:opacity-20"
                      disabled={selectedDate >= today}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  {selectedEntry && !isToday && (
                    <button
                      onClick={() => handleEditDate(selectedDate)}
                      className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors px-2 py-1 rounded-lg bg-purple-500/5"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                  )}
                </div>

                {/* Main Entry Form */}
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Phone size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white">
                        {editId ? "Edit Entry" : "Today's Entry"}
                      </h2>
                      <p className="text-xs text-white/40">{formatDate(selectedDate)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {METRICS.map(metric => {
                      const Icon = metric.icon
                      const value = form[metric.key] as number
                      return (
                        <div key={metric.key} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg ${metric.bg} flex items-center justify-center`}>
                              <Icon size={16} className={metric.color} />
                            </div>
                            <span className="text-sm text-white/70">{metric.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => decrement(metric.key)}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 flex items-center justify-center transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={value}
                              onChange={e => updateField(metric.key, Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-14 text-center text-lg font-bold text-white bg-white/[0.03] border border-white/[0.06] rounded-lg py-1 focus:outline-none focus:border-purple-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() => increment(metric.key)}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 flex items-center justify-center transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Notes */}
                  <div className="mt-4">
                    <textarea
                      placeholder="Add notes about your calls today..."
                      value={form.notes}
                      onChange={e => updateField("notes", e.target.value)}
                      rows={2}
                      className="w-full text-sm text-white/70 bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 focus:outline-none focus:border-purple-500/50 placeholder:text-white/20 resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      {editId && (
                        <button
                          onClick={() => handleDelete(editId)}
                          className="flex items-center gap-1.5 text-xs text-rose-400/60 hover:text-rose-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-500/5"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editId && (
                        <button
                          onClick={resetForm}
                          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                        >
                          <X size={12} />
                          Reset
                        </button>
                      )}
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <Save size={14} />
                        {editId ? "Update Entry" : "Save Entry"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Weekly Summary */}
                {dailyGoals.length > 0 && (
                  <div className="card p-6 mt-4">
                    <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">This Week</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                        <Phone size={16} className="text-blue-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">{weekStats.coldCalls}</div>
                        <div className="text-[10px] text-white/40">Calls</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                        <MessageSquare size={16} className="text-emerald-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">{weekStats.conversations}</div>
                        <div className="text-[10px] text-white/40">Conversations</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                        <Monitor size={16} className="text-purple-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">{weekStats.demos}</div>
                        <div className="text-[10px] text-white/40">Demos</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                        <DoorOpen size={16} className="text-amber-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">{weekStats.gatekeepersPassed}</div>
                        <div className="text-[10px] text-white/40">Gatekeepers</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                        <Video size={16} className="text-rose-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">{weekStats.shows}</div>
                        <div className="text-[10px] text-white/40">Shows</div>
                      </div>
                    </div>
                    <div className="text-center text-[10px] text-white/30 mt-3">
                      Across {weekStats.days} day{weekStats.days !== 1 ? "s" : ""} this week
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* History View */
              <div className="card p-6">
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">History</h2>
                {sortedHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Phone size={32} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">No entries yet. Start tracking your daily goals!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sortedHistory.map((entry, i) => {
                      const isSelected = entry.id === editId
                      const total = entry.coldCalls + entry.conversations + entry.demos + entry.gatekeepersPassed + entry.shows
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-purple-500/10 border border-purple-500/20"
                              : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]"
                          }`}
                          onClick={() => {
                            handleEditDate(entry.date)
                            setShowHistory(false)
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                              <span className="text-xs font-bold text-white/50">
                                {new Date(entry.date + "T00:00:00").getDate()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white/80">
                                {formatDate(entry.date)}
                              </div>
                              <div className="text-xs text-white/40">
                                {entry.coldCalls} calls · {entry.conversations} conv · {entry.demos} demos · {entry.gatekeepersPassed} gates · {entry.shows} shows
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-white/30">{total} total</span>
                            {entry.notes && (
                              <span className="text-xs text-white/20" title={entry.notes}>📝</span>
                            )}
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                handleDelete(entry.id)
                              }}
                              className="p-1 rounded hover:bg-white/5 text-white/20 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
