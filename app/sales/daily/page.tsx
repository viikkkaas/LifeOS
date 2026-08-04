"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { getToday, generateId } from "@/lib/utils"
import { Phone, MessageSquare, Monitor, DoorOpen, Video, Plus, Minus, Trash2, ChevronLeft, ChevronRight, Save, Pencil, X, XCircle, AlertTriangle, CheckCircle2, ThumbsDown, FileText } from "lucide-react"
import type { DailyGoal, ObjectionTally, NoCloseReasonTally } from "@/types"

const METRICS = [
  { key: "coldCalls" as const, label: "Calls Made", icon: Phone, color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "conversations" as const, label: "DM Convos", icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "demos" as const, label: "Demos Booked", icon: Monitor, color: "text-purple-400", bg: "bg-purple-500/10" },
  { key: "gatekeepersPassed" as const, label: "Gatekeepers Passed", icon: DoorOpen, color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "shows" as const, label: "Demos Held", icon: Video, color: "text-rose-400", bg: "bg-rose-500/10" },
]

const OBJECTION_KEYS: { key: keyof ObjectionTally; label: string }[] = [
  { key: "price", label: "Price" },
  { key: "timing", label: "Timing" },
  { key: "trust", label: "Trust" },
  { key: "alreadyHas", label: "Already Has Solution" },
  { key: "other", label: "Other" },
]

const NOCLOSE_REASON_KEYS: { key: keyof NoCloseReasonTally; label: string }[] = [
  { key: "price", label: "Price" },
  { key: "timing", label: "Timing" },
  { key: "trust", label: "Trust" },
  { key: "wantsToThink", label: "Wants to Think" },
  { key: "ghosted", label: "Ghosted / No-Show" },
  { key: "other", label: "Other" },
]

const EMPTY_OBJECTIONS: ObjectionTally = { price: 0, timing: 0, trust: 0, alreadyHas: 0, other: 0 }
const EMPTY_NOCLOSE_REASONS: NoCloseReasonTally = { price: 0, timing: 0, trust: 0, wantsToThink: 0, ghosted: 0, other: 0 }

interface DailyForm {
  date: string
  coldCalls: number
  conversations: number
  demos: number
  gatekeepersPassed: number
  shows: number
  objections: ObjectionTally
  closes: number
  noCloses: number
  noCloseReasons: NoCloseReasonTally
  scriptVersion: string
  notes: string
}

const emptyForm = (date: string): DailyForm => ({
  date,
  coldCalls: 0,
  conversations: 0,
  demos: 0,
  gatekeepersPassed: 0,
  shows: 0,
  objections: { ...EMPTY_OBJECTIONS },
  closes: 0,
  noCloses: 0,
  noCloseReasons: { ...EMPTY_NOCLOSE_REASONS },
  scriptVersion: "",
  notes: "",
})

const toForm = (entry: DailyGoal): DailyForm => ({
  date: entry.date,
  coldCalls: entry.coldCalls,
  conversations: entry.conversations,
  demos: entry.demos,
  gatekeepersPassed: entry.gatekeepersPassed,
  shows: entry.shows,
  objections: { ...EMPTY_OBJECTIONS, ...entry.objections },
  closes: entry.closes,
  noCloses: entry.noCloses,
  noCloseReasons: { ...EMPTY_NOCLOSE_REASONS, ...entry.noCloseReasons },
  scriptVersion: entry.scriptVersion ?? "",
  notes: entry.notes,
})

export default function DailyLogPage() {
  const { state, dispatch } = useApp()
  const { dailyGoals = [] } = state.data
  const today = getToday()

  const todayEntry = dailyGoals.find(dg => dg.date === today)

  const [editId, setEditId] = useState<string | null>(todayEntry?.id ?? null)
  const [form, setForm] = useState<DailyForm>(todayEntry ? toForm(todayEntry) : emptyForm(today))
  const [selectedDate, setSelectedDate] = useState(today)
  const [showHistory, setShowHistory] = useState(false)

  const usedScriptVersions = useMemo(() => {
    const versions = dailyGoals.map(dg => dg.scriptVersion).filter(Boolean)
    return Array.from(new Set(versions))
  }, [dailyGoals])

  const selectedEntry = dailyGoals.find(dg => dg.date === selectedDate)
  const isToday = selectedDate === today

  const updateField = (key: keyof DailyForm, value: number | string | ObjectionTally | NoCloseReasonTally) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const increment = (key: keyof DailyForm) => {
    setForm(prev => ({ ...prev, [key]: typeof prev[key] === "number" ? (prev[key] as number) + 1 : prev[key] }))
  }

  const decrement = (key: keyof DailyForm) => {
    setForm(prev => ({ ...prev, [key]: typeof prev[key] === "number" ? Math.max(0, (prev[key] as number) - 1) : prev[key] }))
  }

  const bumpObjection = (key: keyof ObjectionTally, delta: number) => {
    setForm(prev => ({
      ...prev,
      objections: { ...prev.objections, [key]: Math.max(0, prev.objections[key] + delta) },
    }))
  }

  const bumpNoCloseReason = (key: keyof NoCloseReasonTally, delta: number) => {
    setForm(prev => ({
      ...prev,
      noCloseReasons: { ...prev.noCloseReasons, [key]: Math.max(0, prev.noCloseReasons[key] + delta) },
    }))
  }

  const resetForm = () => {
    setForm(emptyForm(today))
    setEditId(null)
  }

  const loadEntry = (entry: DailyGoal) => {
    setForm(toForm(entry))
    setEditId(entry.id)
    setSelectedDate(entry.date)
  }

  const handleSave = () => {
    if (editId) {
      dispatch({
        type: "UPDATE_DAILY_GOAL",
        payload: { ...form, id: editId, createdAt: dailyGoals.find(dg => dg.id === editId)?.createdAt ?? new Date().toISOString() } as DailyGoal,
      })
    } else {
      dispatch({
        type: "ADD_DAILY_GOAL",
        payload: { ...form, id: generateId(), createdAt: new Date().toISOString() } as DailyGoal,
      })
      setEditId(todayEntry?.id ?? null)
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
    const totals = weekEntries.reduce((acc, e) => {
      acc.coldCalls += e.coldCalls
      acc.conversations += e.conversations
      acc.demos += e.demos
      acc.gatekeepersPassed += e.gatekeepersPassed
      acc.shows += e.shows
      acc.closes += e.closes
      acc.noCloses += e.noCloses
      acc.objectionTotal += e.objections ? Object.values(e.objections).reduce((s, v) => s + v, 0) : 0
      return acc
    }, { coldCalls: 0, conversations: 0, demos: 0, gatekeepersPassed: 0, shows: 0, closes: 0, noCloses: 0, objectionTotal: 0 })
    return { ...totals, days: weekEntries.length }
  }, [dailyGoals])

  const gatekeeperRate = weekStats.coldCalls > 0 ? Math.round((weekStats.gatekeepersPassed / weekStats.coldCalls) * 100) : 0
  const convRate = weekStats.coldCalls > 0 ? Math.round((weekStats.conversations / weekStats.coldCalls) * 100) : 0
  const demoRate = weekStats.conversations > 0 ? Math.round((weekStats.demos / weekStats.conversations) * 100) : 0
  const closeRate = weekStats.shows > 0 ? Math.round((weekStats.closes / weekStats.shows) * 100) : 0
  const noShowCount = weekStats.demos - weekStats.shows

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
        loadEntry(entry)
      } else {
        setForm(emptyForm(dateStr))
        setEditId(null)
      }
    } else {
      resetForm()
      if (todayEntry) {
        setForm(toForm(todayEntry))
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
                <h1 className="text-2xl font-bold text-white">Daily Log</h1>
                <p className="text-white/40 text-sm mt-1">Track your call performance every day</p>
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
                      onClick={() => loadEntry(selectedEntry)}
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

                  {/* Core counters */}
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

                    {/* No-shows (derived) */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
                          <XCircle size={16} className="text-rose-400" />
                        </div>
                        <div>
                          <span className="text-sm text-white/70">No-Shows</span>
                          <div className="text-[10px] text-white/30">booked − held</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white">{Math.max(0, form.demos - form.shows)}</div>
                    </div>

                    {/* Closes */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        </div>
                        <span className="text-sm text-white/70">Closes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decrement("closes")}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 flex items-center justify-center transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={form.closes}
                          onChange={e => updateField("closes", Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-14 text-center text-lg font-bold text-white bg-white/[0.03] border border-white/[0.06] rounded-lg py-1 focus:outline-none focus:border-purple-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => increment("closes")}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 flex items-center justify-center transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* No-closes */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <ThumbsDown size={16} className="text-amber-400" />
                        </div>
                        <span className="text-sm text-white/70">No-Closes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decrement("noCloses")}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 flex items-center justify-center transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={form.noCloses}
                          onChange={e => updateField("noCloses", Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-14 text-center text-lg font-bold text-white bg-white/[0.03] border border-white/[0.06] rounded-lg py-1 focus:outline-none focus:border-purple-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => increment("noCloses")}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 flex items-center justify-center transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Script version */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center">
                          <FileText size={16} className="text-sky-400" />
                        </div>
                        <span className="text-sm text-white/70">Script Version</span>
                      </div>
                      <input
                        list="script-versions"
                        value={form.scriptVersion}
                        onChange={e => updateField("scriptVersion", e.target.value)}
                        placeholder="V7"
                        className="w-24 text-center text-sm font-semibold text-white bg-white/[0.03] border border-white/[0.06] rounded-lg py-1.5 focus:outline-none focus:border-purple-500/50 placeholder:text-white/20"
                      />
                      <datalist id="script-versions">
                        {usedScriptVersions.map(v => (
                          <option key={v} value={v} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Objections */}
                  <div className="mt-5">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} className="text-amber-400" />
                      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Objections Heard</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {OBJECTION_KEYS.map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <span className="text-xs text-white/60">{label}</span>
                          <span className="text-sm font-bold text-white min-w-[16px] text-center">{form.objections[key]}</span>
                          <button
                            onClick={() => bumpObjection(key, 1)}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 flex items-center justify-center transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                          {form.objections[key] > 0 && (
                            <button
                              onClick={() => bumpObjection(key, -1)}
                              className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 flex items-center justify-center transition-colors"
                            >
                              <Minus size={11} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* No-close reasons */}
                  <div className="mt-5">
                    <div className="flex items-center gap-2 mb-2">
                      <ThumbsDown size={14} className="text-rose-400" />
                      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">No-Close Reasons</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {NOCLOSE_REASON_KEYS.map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <span className="text-xs text-white/60">{label}</span>
                          <span className="text-sm font-bold text-white min-w-[16px] text-center">{form.noCloseReasons[key]}</span>
                          <button
                            onClick={() => bumpNoCloseReason(key, 1)}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 flex items-center justify-center transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                          {form.noCloseReasons[key] > 0 && (
                            <button
                              onClick={() => bumpNoCloseReason(key, -1)}
                              className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 flex items-center justify-center transition-colors"
                            >
                              <Minus size={11} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
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
                        <div className="text-[10px] text-white/40">DM Convos</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                        <Monitor size={16} className="text-purple-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">{weekStats.demos}</div>
                        <div className="text-[10px] text-white/40">Demos Booked</div>
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

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                        <div className="text-sm font-bold text-emerald-400">{gatekeeperRate}%</div>
                        <div className="text-[10px] text-white/40">Call → Gatekeeper</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                        <div className="text-sm font-bold text-emerald-400">{convRate}%</div>
                        <div className="text-[10px] text-white/40">Call → Convo</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                        <div className="text-sm font-bold text-emerald-400">{demoRate}%</div>
                        <div className="text-[10px] text-white/40">Convo → Demo</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                        <div className="text-sm font-bold text-emerald-400">{closeRate}%</div>
                        <div className="text-[10px] text-white/40">Show → Close</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                        <div className="text-sm font-bold text-rose-400">{noShowCount}</div>
                        <div className="text-[10px] text-white/40">No-Shows</div>
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
                            loadEntry(entry)
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
                                {entry.closes > 0 && <span className="text-emerald-400/70"> · {entry.closes} closed</span>}
                                {entry.scriptVersion && <span className="text-sky-400/70"> · {entry.scriptVersion}</span>}
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
