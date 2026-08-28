"use client"

import { useEffect, useState, useMemo } from "react"
import { cn, generateId } from "@/lib/utils"
import {
  CalendarDays, Check, ChevronDown, ChevronUp, Plus, Trash2, X,
  Edit3, Flame, TrendingUp, TrendingDown, Minus,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

const STORAGE_KEY = "sixmonth"
const TOTAL_DAYS = 180
const BLOCK_SIZE = 30

interface Habit {
  id: string
  name: string
  target: number | null
  isStretch: boolean
  order: number
}

interface SixMonthState {
  startDate: string | null
  habits: Habit[]
  checks: Record<string, Record<number, number>>
  notes: Record<string, string>
}

const DEFAULT_HABITS: Habit[] = [
  { id: "gym", name: "Gym", target: null, isStretch: false, order: 0 },
  { id: "cold-calls", name: "Cold Calls", target: null, isStretch: false, order: 1 },
  { id: "meditation", name: "Meditation", target: null, isStretch: false, order: 2 },
  { id: "journal", name: "Journal", target: null, isStretch: false, order: 3 },
  { id: "coding", name: "Coding", target: null, isStretch: false, order: 4 },
  { id: "read", name: "Read", target: null, isStretch: false, order: 5 },
]

function emptyState(): SixMonthState {
  return { startDate: null, habits: DEFAULT_HABITS, checks: {}, notes: {} }
}

export default function SixMonthTracker() {
  const [state, setState] = useState<SixMonthState>(emptyState)
  const [loaded, setLoaded] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [noteDraft, setNoteDraft] = useState("")
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{ habitId: string; day: number } | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)
  const [newHabitName, setNewHabitName] = useState("")
  const [newHabitTarget, setNewHabitTarget] = useState("")
  const [newHabitStretch, setNewHabitStretch] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SixMonthState>
        const habits = Array.isArray(parsed?.habits) && parsed.habits.length
          ? parsed.habits
          : DEFAULT_HABITS
        setState({
          startDate: parsed?.startDate ?? null,
          habits,
          checks: parsed?.checks ?? {},
          notes: parsed?.notes ?? {},
        })
      }
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, loaded])

  const coreHabits = useMemo(
    () => state.habits.filter(h => !h.isStretch).sort((a, b) => a.order - b.order),
    [state.habits]
  )
  const stretchHabits = useMemo(
    () => state.habits.filter(h => h.isStretch).sort((a, b) => a.order - b.order),
    [state.habits]
  )
  const sortedHabits = useMemo(() => [...coreHabits, ...stretchHabits], [coreHabits, stretchHabits])

  const blocks = useMemo(() => {
    const result: { start: number; end: number }[] = []
    for (let s = 1; s <= TOTAL_DAYS; s += BLOCK_SIZE) {
      result.push({ start: s, end: Math.min(s + BLOCK_SIZE - 1, TOTAL_DAYS) })
    }
    return result
  }, [])

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const elapsed = useMemo(() => {
    if (!state.startDate) return 0
    const start = new Date(state.startDate)
    start.setHours(0, 0, 0, 0)
    const diff = Math.floor((today.getTime() - start.getTime()) / 86400000)
    return Math.min(Math.max(diff + 1, 0), TOTAL_DAYS)
  }, [state.startDate, today])

  const habitValue = (habitId: string, day: number) => state.checks[habitId]?.[day] ?? 0

  const habitTarget = (habitId: string): number | null => state.habits.find(h => h.id === habitId)?.target ?? null

  const isDone = (habitId: string, day: number): boolean => {
    const v = habitValue(habitId, day)
    const t = habitTarget(habitId)
    return t === null ? v >= 1 : v >= t
  }

  const setStartDate = (date: string) => {
    setState(prev => ({ ...prev, startDate: date }))
  }

  const toggleBinary = (habitId: string, day: number) => {
    setState(prev => {
      const row = prev.checks[habitId] ?? {}
      const current = row[day] ?? 0
      return { ...prev, checks: { ...prev.checks, [habitId]: { ...row, [day]: current >= 1 ? 0 : 1 } } }
    })
  }

  const commitNumeric = (habitId: string, day: number, value: number) => {
    setState(prev => {
      const row = prev.checks[habitId] ?? {}
      const safe = isNaN(value) || value < 0 ? 0 : Math.floor(value)
      return { ...prev, checks: { ...prev.checks, [habitId]: { ...row, [day]: safe } } }
    })
  }

  const startEditing = (habitId: string, day: number) => {
    setEditingCell({ habitId, day })
    setEditingValue(String(habitValue(habitId, day) ?? ""))
  }

  const commitEditing = () => {
    if (editingCell) {
      commitNumeric(editingCell.habitId, editingCell.day, Number(editingValue))
    }
    setEditingCell(null)
  }

  // ---- derived stats ----

  const isPassDay = (day: number): boolean => {
    return coreHabits.length > 0 && coreHabits.every(h => isDone(h.id, day))
  }

  const overallPct = useMemo(() => {
    if (elapsed === 0 || coreHabits.length === 0) return 0
    let done = 0
    coreHabits.forEach(h => {
      for (let d = 1; d <= elapsed; d++) if (isDone(h.id, d)) done++
    })
    return Math.round((done / (coreHabits.length * elapsed)) * 100)
  }, [elapsed, coreHabits, state.checks])

  const currentStreak = useMemo(() => {
    let s = 0
    for (let d = elapsed; d >= 1; d--) {
      if (isPassDay(d)) s++
      else break
    }
    return s
  }, [elapsed, state.checks, coreHabits])

  const longestStreak = useMemo(() => {
    let best = 0
    let cur = 0
    for (let d = 1; d <= elapsed; d++) {
      if (isPassDay(d)) { cur++; if (cur > best) best = cur }
      else cur = 0
    }
    return best
  }, [elapsed, state.checks, coreHabits])

  const monthBreakdown = useMemo(() => {
    return Array.from({ length: 6 }, (_, m) => {
      const start = m * 30 + 1
      const end = Math.min(m * 30 + 30, TOTAL_DAYS)
      let done = 0
      let possible = 0
      for (let d = start; d <= end; d++) {
        if (d > elapsed) break
        coreHabits.forEach(h => {
          possible++
          if (isDone(h.id, d)) done++
        })
      }
      return { month: m + 1, pct: possible > 0 ? Math.round((done / possible) * 100) : 0 }
    })
  }, [elapsed, coreHabits, state.checks])

  const daysRemaining = Math.max(TOTAL_DAYS - elapsed, 0)
  const noteCount = Object.keys(state.notes).length

  // ---- notes ----

  const openDay = (day: number) => {
    setSelectedDay(day)
    setNoteDraft(state.notes[String(day)] ?? "")
  }

  const saveNote = () => {
    if (!selectedDay) return
    setState(prev => {
      const next = { ...prev.notes }
      if (noteDraft.trim()) next[String(selectedDay)] = noteDraft.trim()
      else delete next[String(selectedDay)]
      return { ...prev, notes: next }
    })
    setSelectedDay(null)
  }

  const dayDate = (day: number): string => {
    if (!state.startDate) return ""
    const d = new Date(state.startDate)
    d.setDate(d.getDate() + (day - 1))
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
  }

  // ---- habit editing ----

  const addHabit = () => {
    const name = newHabitName.trim()
    if (!name) return
    const target = newHabitTarget.trim() === "" ? null : Math.max(1, Math.floor(Number(newHabitTarget)))
    setState(prev => ({
      ...prev,
      habits: [...prev.habits, { id: generateId(), name, target, isStretch: newHabitStretch, order: prev.habits.length }],
    }))
    setNewHabitName("")
    setNewHabitTarget("")
    setNewHabitStretch(false)
  }

  const removeHabit = (id: string) => {
    if (confirm("Remove this habit and its data?")) {
      setState(prev => {
        const habits = prev.habits.filter(h => h.id !== id)
        const checks = { ...prev.checks }
        delete checks[id]
        return { ...prev, habits, checks }
      })
    }
  }

  const moveHabit = (id: string, dir: -1 | 1) => {
    setState(prev => {
      const current = prev.habits
      const idx = current.findIndex(h => h.id === id)
      const target = idx + dir
      if (idx < 0 || target < 0 || target >= current.length) return prev
      const next = [...current]
      const [item] = next.splice(idx, 1)
      next.splice(target, 0, item)
      return { ...prev, habits: next.map((h, i) => ({ ...h, order: i })) }
    })
  }

  const resetAll = () => {
    if (confirm("Reset the entire six-month tracker? This clears all progress, habits, and notes.")) {
      localStorage.removeItem(STORAGE_KEY)
      setState(emptyState())
      setSelectedDay(null)
      setExpandedHabit(null)
      setShowEditModal(false)
      setEditingCell(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* ---- Header / controls ---- */}
      <div className="flex flex-wrap items-center justify-between gap-3 card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-white/60">
            <CalendarDays size={16} className="text-[#667eea]" />
            <span className="text-sm font-medium">Start Date</span>
          </div>
          <input
            type="date"
            value={state.startDate ?? ""}
            onChange={e => setStartDate(e.target.value)}
            className="input-premium !w-auto"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30 hidden sm:inline">{noteCount} note{noteCount !== 1 ? "s" : ""}</span>
          <button onClick={() => setShowEditModal(true)} className="btn-ghost flex items-center gap-2">
            <Edit3 size={15} /> Edit Habits
          </button>
          <button onClick={resetAll} className="btn-ghost !text-red-400/80 hover:!text-red-400">Reset</button>
        </div>
      </div>

      {/* ---- Stats dashboard ---- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Completion" value={`${overallPct}%`} accent="from-[#667eea] to-[#764ba2]" />
        <StatCard label="Current Streak" value={`${currentStreak}d`} accent="from-[#f59e0b] to-[#f97316]" />
        <StatCard label="Longest Streak" value={`${longestStreak}d`} accent="from-[#34d399] to-[#10b981]" />
        <StatCard label="Day" value={`${elapsed}/${TOTAL_DAYS}`} accent="from-[#f472b6] to-[#ec4899]" />
        <StatCard label="Days Left" value={`${daysRemaining}`} accent="from-[#38bdf8] to-[#6366f1]" />
      </div>

      {/* ---- Progress bar with phase markers ---- */}
      {state.startDate && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Progress</span>
            <span className="text-xs text-white/60">{elapsed} of {TOTAL_DAYS} days</span>
          </div>
          <div className="relative">
            <div className="relative h-3 rounded-full bg-white/[0.06] overflow-visible">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] transition-all duration-700"
                style={{ width: `${(elapsed / TOTAL_DAYS) * 100}%` }}
              />
              {blocks.map(b => (
                <div
                  key={b.start}
                  className="absolute top-0 flex flex-col items-center"
                  style={{ left: `${((b.start - 1) / TOTAL_DAYS) * 100}%` }}
                >
                  <div className="w-px h-3 bg-white/20" />
                </div>
              ))}
              <div
                className="absolute -top-1.5 -translate-x-1/2 w-6 h-6 rounded-full bg-white shadow-lg shadow-purple-500/40 flex items-center justify-center"
                style={{ left: `${Math.max((elapsed / TOTAL_DAYS) * 100, 3)}%` }}
              >
                <span className="text-[8px] font-bold text-[#667eea]">{elapsed}</span>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-white/40">
              {blocks.map(b => (
                <span key={b.start} className={cn("flex items-center gap-0.5", b.end <= elapsed && "text-emerald-400")}>
                  {b.end === TOTAL_DAYS ? TOTAL_DAYS : b.end}
                  {b.end <= elapsed && <Check size={9} strokeWidth={3} />}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---- Month breakdown ---- */}
      {state.startDate && (
        <div className="card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Monthly Completion</div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {monthBreakdown.map(mm => (
              <div key={mm.month} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-white/50">M{mm.month}</span>
                  <span className="text-sm font-semibold text-white">{mm.pct}%</span>
                </div>
                <div className="w-full h-1.5 progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${mm.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- The grid ---- */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
        <div className="min-w-max p-2">
          {/* header */}
          <div className="flex items-center gap-x-1.5 pb-1">
            <div className="w-[150px] shrink-0" />
            {blocks.map(block => (
              <div key={block.start} className="grid gap-x-1 grow-0" style={{ gridTemplateColumns: `repeat(${block.end - block.start + 1}, 24px)` }}>
                {Array.from({ length: block.end - block.start + 1 }, (_, i) => {
                  const day = block.start + i
                  const hasNote = !!state.notes[String(day)]
                  const future = day > elapsed
                  return (
                    <button
                      key={day}
                      onClick={() => openDay(day)}
                      title={`Day ${day} — ${hasNote ? "has note" : "add note"}`}
                      className={cn(
                        "relative text-center text-[11px] font-medium py-1 rounded",
                        future ? "text-white/20" : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
                      )}
                    >
                      <span className={cn(day === elapsed && !future && "text-[#667eea] font-bold")}>{day}</span>
                      {hasNote && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#667eea]" />}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* core habit rows */}
          {coreHabits.map(habit => (
            <HabitRow
              key={habit.id}
              habit={habit}
              state={state}
              blocks={blocks}
              elapsed={elapsed}
              expanded={expandedHabit === habit.id}
              editingCell={editingCell}
              editingValue={editingValue}
              onToggleExpand={() => setExpandedHabit(prev => (prev === habit.id ? null : habit.id))}
              onToggle={toggleBinary}
              onStartEdit={startEditing}
              onCommitEdit={commitEditing}
              onSetEditingValue={setEditingValue}
              onOpenDay={openDay}
            />
          ))}

          {/* stretch divider */}
          {stretchHabits.length > 0 && (
            <div className="flex items-center gap-3 my-2 px-2">
              <div className="text-[11px] uppercase tracking-wider text-white/30 font-semibold">Stretch Goals</div>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
          )}

          {/* stretch rows */}
          {stretchHabits.map(habit => (
            <HabitRow
              key={habit.id}
              habit={habit}
              state={state}
              blocks={blocks}
              elapsed={elapsed}
              stretch
              expanded={expandedHabit === habit.id}
              editingCell={editingCell}
              editingValue={editingValue}
              onToggleExpand={() => setExpandedHabit(prev => (prev === habit.id ? null : habit.id))}
              onToggle={toggleBinary}
              onStartEdit={startEditing}
              onCommitEdit={commitEditing}
              onSetEditingValue={setEditingValue}
              onOpenDay={openDay}
            />
          ))}
        </div>
      </div>

      {/* ---- Notes side panel ---- */}
      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedDay(null)}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-[#0d0d16] border-l border-white/[0.06] p-5 overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="text-xs text-white/40">Day {selectedDay}</div>
                  <h3 className="text-lg font-bold text-white">{dayDate(selectedDay)}</h3>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-1 rounded hover:bg-white/5 text-white/50">
                  <X size={18} />
                </button>
              </div>

              <div className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Habits</div>
              <div className="mb-5 space-y-2">
                {sortedHabits.map(h => {
                  const d = isDone(h.id, selectedDay)
                  const v = habitValue(h.id, selectedDay)
                  const t = h.target
                  return (
                    <button
                      key={h.id}
                      onClick={() => (t === null ? toggleBinary(h.id, selectedDay) : commitNumeric(h.id, selectedDay, d ? 0 : t))}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                    >
                      <span className={cn("text-sm", h.isStretch ? "text-white/40" : "text-white/80", d && "line-through text-white/40")}>
                        {h.name}
                      </span>
                      <span className={cn("text-xs font-mono", d ? "text-emerald-400" : "text-white/50")}>
                        {t === null ? (d ? "✓" : "—") : `${v}/${t}`}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Daily Note</div>
              <textarea
                value={noteDraft}
                onChange={e => setNoteDraft(e.target.value)}
                placeholder="What happened today? Wins, lessons, ideas..."
                className="input-premium min-h-[120px] resize-none"
              />
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setSelectedDay(null); saveNote() }} className="btn-premium flex-1">Save Note</button>
                <button
                  onClick={() => { setNoteDraft(""); }}
                  className="btn-ghost"
                >
                  Clear
                </button>
              </div>
              {noteCount > 0 && (
                <div className="mt-5 text-xs text-white/30">{noteCount} day{noteCount !== 1 ? "s" : ""} have notes</div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ---- Edit habits modal ---- */}
      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto p-5" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Edit Habits</h3>
                  <button onClick={() => setShowEditModal(false)} className="p-1 rounded hover:bg-white/5 text-white/50"><X size={18} /></button>
                </div>

                <div className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Your Habits</div>
                <div className="space-y-2 mb-5">
                  {[...state.habits].sort((a, b) => a.order - b.order).map((h, i) => (
                    <div key={h.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
                      <div className="flex flex-col">
                        <button onClick={() => moveHabit(h.id, -1)} disabled={i === 0} className="text-white/30 hover:text-white/70 disabled:opacity-20"><ChevronUp size={14} /></button>
                        <button onClick={() => moveHabit(h.id, 1)} disabled={i === [...state.habits].sort((a, b) => a.order - b.order).length - 1} className="text-white/30 hover:text-white/70 disabled:opacity-20"><ChevronDown size={14} /></button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white/80 truncate">{h.name}</div>
                        <div className="text-[11px] text-white/30">
                          {h.isStretch ? "Stretch" : "Core"}{h.target !== null && ` · target ${h.target}`}
                        </div>
                      </div>
                      <button onClick={() => removeHabit(h.id)} className="p-1 rounded hover:bg-red-500/10 text-white/30 hover:text-red-400"><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>

                <div className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Add Habit</div>
                <input
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  placeholder="Habit name"
                  className="input-premium mb-2"
                />
                <input
                  value={newHabitTarget}
                  onChange={e => setNewHabitTarget(e.target.value)}
                  placeholder="Daily target (optional, e.g. 10 pages)"
                  type="number"
                  min="0"
                  className="input-premium mb-2"
                />
                <label className="flex items-center gap-2 text-sm text-white/60 mb-3 cursor-pointer">
                  <input type="checkbox" checked={newHabitStretch} onChange={e => setNewHabitStretch(e.target.checked)} className="accent-[#667eea]" />
                  Stretch / bonus goal (excluded from core %)
                </label>
                <button onClick={addHabit} className="btn-premium w-full flex items-center justify-center gap-2">
                  <Plus size={16} /> Add Habit
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---- Sub-components ----

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="card p-4">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center mb-2`}>
        <span className="text-white font-bold text-[11px]">{value.replace(/[^0-9%/]/g, "")}</span>
      </div>
      <div className="text-2xl font-bold text-white leading-none">{value}</div>
      <div className="text-[11px] text-white/40 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function HabitRow({
  habit, state, blocks, elapsed, stretch, expanded,
  editingCell, editingValue,
  onToggleExpand, onToggle, onStartEdit, onCommitEdit, onSetEditingValue, onOpenDay,
}: {
  habit: Habit
  state: SixMonthState
  blocks: { start: number; end: number }[]
  elapsed: number
  stretch?: boolean
  expanded: boolean
  editingCell: { habitId: string; day: number } | null
  editingValue: string
  onToggleExpand: () => void
  onToggle: (habitId: string, day: number) => void
  onStartEdit: (habitId: string, day: number) => void
  onCommitEdit: () => void
  onSetEditingValue: (v: string) => void
  onOpenDay: (day: number) => void
}) {
  const value = (day: number) => state.checks[habit.id]?.[day] ?? 0
  const done = (day: number) => habit.target === null ? value(day) >= 1 : value(day) >= habit.target

  return (
    <div className="my-1.5">
      <div className="flex items-center gap-x-1.5 py-1">
        <button
          onClick={onToggleExpand}
          className="w-[150px] shrink-0 flex items-center gap-1.5 text-left"
          title="Click for details"
        >
          <ChevronDown size={12} className={cn("text-white/30 transition-transform", expanded && "rotate-180")} />
          <span className={cn("text-sm font-medium truncate", stretch ? "text-white/40" : "text-white/80")}>{habit.name}</span>
          {habit.target !== null && <span className="text-[10px] text-white/30 font-mono">~{habit.target}</span>}
        </button>

        {blocks.map(block => (
          <div key={block.start} className="grid gap-x-1" style={{ gridTemplateColumns: `repeat(${block.end - block.start + 1}, 24px)` }}>
            {Array.from({ length: block.end - block.start + 1 }, (_, i) => {
              const day = block.start + i
              const v = value(day)
              const d = done(day)
              const future = day > elapsed
              const partiallyDone = habit.target !== null && v > 0 && v < habit.target
              const isEditing = editingCell?.habitId === habit.id && editingCell?.day === day

              if (isEditing) {
                return (
                  <div key={day} className="relative">
                    <input
                      autoFocus
                      value={editingValue}
                      onChange={e => onSetEditingValue(e.target.value)}
                      onBlur={onCommitEdit}
                      onKeyDown={e => { if (e.key === "Enter") onCommitEdit(); if (e.key === "Escape") onCommitEdit() }}
                      type="number"
                      min="0"
                      className="h-6 w-6 text-center text-[10px] bg-white/[0.08] border border-[#667eea] rounded outline-none text-white"
                    />
                  </div>
                )
              }

              return (
                <button
                  key={day}
                  onClick={() => (habit.target === null ? onToggle(habit.id, day) : onStartEdit(habit.id, day))}
                  onDoubleClick={() => onOpenDay(day)}
                  aria-label={`${habit.name} day ${day} ${d ? "done" : "not done"}${habit.target !== null ? ` ${v}/${habit.target}` : ""}`}
                  className={cn(
                    "h-6 w-6 rounded transition-all flex items-center justify-center text-[11px]",
                    future ? "bg-white/[0.02] border border-transparent cursor-default"
                      : d
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : partiallyDone
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-white/5 border border-white/[0.04] hover:bg-white/10"
                  )}
                >
                  {habit.target === null ? (d ? <Check size={12} strokeWidth={3} /> : null) : d ? v : v > 0 ? v : null}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <HabitDetailStat habit={habit} elapsed={elapsed} state={state} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function HabitDetailStat({ habit, elapsed, state }: { habit: Habit; elapsed: number; state: SixMonthState }) {
  const row = state.checks[habit.id] ?? {}
  const target = habit.target

  const stats = useMemo(() => {
    let days = 0
    let cur = 0
    let longest = 0
    let run = 0
    const met = (d: number) => (target === null ? (row[d] ?? 0) >= 1 : (row[d] ?? 0) >= target)
    for (let d = 1; d <= elapsed; d++) {
      if (met(d)) { days++; run++; if (run > longest) longest = run }
      else run = 0
    }
    for (let d = elapsed; d >= 1; d--) { if (met(d)) cur++; else break }
    let recent = 0
    let prev = 0
    for (let d = Math.max(1, elapsed - 6); d <= elapsed; d++) if (met(d)) recent++
    for (let d = Math.max(1, elapsed - 13); d <= Math.max(0, elapsed - 7); d++) if (met(d)) prev++
    const pct = elapsed > 0 ? Math.round((days / elapsed) * 100) : 0
    const prevPct = elapsed >= 7 ? Math.round((prev / 7) * 100) : 0
    const trend = prevPct === pct ? "flat" : pct > prevPct ? "up" : "down"
    return { days, cur, longest, pct, recent, trend }
  }, [elapsed, row, target])

  return (
    <div className="mx-[150px] my-1 mb-2 grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
      <div>
        <div className="text-[10px] text-white/30 uppercase tracking-wider">Completion</div>
        <div className="text-lg font-bold text-white">{stats.pct}%</div>
      </div>
      <div>
        <div className="text-[10px] text-white/30 uppercase tracking-wider">Current Streak</div>
        <div className="text-lg font-bold text-white flex items-center gap-1"><Flame size={15} className="text-orange-400" />{stats.cur}</div>
      </div>
      <div>
        <div className="text-[10px] text-white/30 uppercase tracking-wider">Longest Streak</div>
        <div className="text-lg font-bold text-white">{stats.longest}</div>
      </div>
      <div>
        <div className="text-[10px] text-white/30 uppercase tracking-wider">7-Day Trend</div>
        <div className="text-lg font-bold text-white flex items-center gap-1">
          {stats.recent}/7
          {stats.trend === "up" ? <TrendingUp size={15} className="text-emerald-400" />
            : stats.trend === "down" ? <TrendingDown size={15} className="text-red-400" />
            : <Minus size={15} className="text-white/30" />}
        </div>
      </div>
    </div>
  )
}
