"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { getToday, generateId } from "@/lib/utils"
import { CalendarCheck, Phone, MessageSquare, Monitor, DoorOpen, Video, CheckCircle2, Save, Pencil, Trash2, X, TrendingUp } from "lucide-react"
import type { WeeklyReview } from "@/types"

interface ReviewForm {
  weekStart: string
  scriptChanges: string
  leadsRemaining: number
  bugsFixed: string
  bugsOpen: string
  hoursSales: number
  hoursTech: number
  hoursCollege: number
  notes: string
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().split("T")[0]
}

const emptyForm = (weekStart: string): ReviewForm => ({
  weekStart,
  scriptChanges: "",
  leadsRemaining: 0,
  bugsFixed: "",
  bugsOpen: "",
  hoursSales: 0,
  hoursTech: 0,
  hoursCollege: 0,
  notes: "",
})

const toForm = (review: WeeklyReview): ReviewForm => ({
  weekStart: review.weekStart,
  scriptChanges: review.scriptChanges,
  leadsRemaining: review.leadsRemaining,
  bugsFixed: review.bugsFixed,
  bugsOpen: review.bugsOpen,
  hoursSales: review.hoursSales,
  hoursTech: review.hoursTech,
  hoursCollege: review.hoursCollege,
  notes: review.notes,
})

export default function WeeklyReviewPage() {
  const { state, dispatch } = useApp()
  const { weeklyReviews = [], dailyGoals = [] } = state.data
  const today = getToday()
  const currentWeekStart = getWeekStart(today)

  const currentReview = weeklyReviews.find(w => w.weekStart === currentWeekStart)

  const [editId, setEditId] = useState<string | null>(currentReview?.id ?? null)
  const [form, setForm] = useState<ReviewForm>(currentReview ? toForm(currentReview) : emptyForm(currentWeekStart))
  const [showHistory, setShowHistory] = useState(false)

  // Auto-computed stats for the current week (from daily entries)
  const weekStats = useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    const entries = dailyGoals.filter(dg => {
      const d = new Date(dg.date)
      return d >= start && d <= now
    })

    const totals = entries.reduce((acc, e) => {
      acc.coldCalls += e.coldCalls
      acc.conversations += e.conversations
      acc.gatekeepersPassed += e.gatekeepersPassed
      acc.demos += e.demos
      acc.shows += e.shows
      acc.closes += e.closes
      acc.noCloses += e.noCloses
      return acc
    }, { coldCalls: 0, conversations: 0, gatekeepersPassed: 0, demos: 0, shows: 0, closes: 0, noCloses: 0 })

    const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : 0)

    // Best script version by close rate
    const byScript = new Map<string, { shows: number; closes: number; calls: number }>()
    for (const e of entries) {
      if (!e.scriptVersion) continue
      const agg = byScript.get(e.scriptVersion) ?? { shows: 0, closes: 0, calls: 0 }
      agg.shows += e.shows
      agg.closes += e.closes
      agg.calls += e.coldCalls
      byScript.set(e.scriptVersion, agg)
    }
    let bestScript: { version: string; closeRate: number; calls: number } | null = null
    byScript.forEach((agg, version) => {
      const closeRate = pct(agg.closes, agg.shows)
      if (!bestScript || closeRate > bestScript.closeRate) {
        bestScript = { version, closeRate, calls: agg.calls }
      }
    })

    return {
      ...totals,
      gatekeeperRate: pct(totals.gatekeepersPassed, totals.coldCalls),
      convRate: pct(totals.conversations, totals.coldCalls),
      demoRate: pct(totals.demos, totals.conversations),
      closeRate: pct(totals.closes, totals.shows),
      noShows: Math.max(0, totals.demos - totals.shows),
      bestScript: bestScript as { version: string; closeRate: number; calls: number } | null,
      days: entries.length,
    }
  }, [dailyGoals])

  const updateField = (key: keyof ReviewForm, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm(currentWeekStart))
    setEditId(null)
  }

  const handleSave = () => {
    if (editId) {
      dispatch({
        type: "UPDATE_WEEKLY_REVIEW",
        payload: { ...form, id: editId, createdAt: weeklyReviews.find(w => w.id === editId)?.createdAt ?? new Date().toISOString() } as WeeklyReview,
      })
    } else {
      dispatch({
        type: "ADD_WEEKLY_REVIEW",
        payload: { ...form, id: generateId(), createdAt: new Date().toISOString() } as WeeklyReview,
      })
      setEditId(currentReview?.id ?? null)
    }
  }

  const handleDelete = (id: string) => {
    dispatch({ type: "DELETE_WEEKLY_REVIEW", payload: id })
    if (editId === id) resetForm()
  }

  const sortedHistory = useMemo(() => {
    return [...weeklyReviews].sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime())
  }, [weeklyReviews])

  const formatWeek = (weekStart: string) => {
    const start = new Date(weekStart + "T00:00:00")
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  }

  const funnel = [
    { label: "Call → Gatekeeper", value: weekStats.gatekeeperRate, icon: DoorOpen, color: "text-amber-400" },
    { label: "Call → Convo", value: weekStats.convRate, icon: MessageSquare, color: "text-emerald-400" },
    { label: "Convo → Demo", value: weekStats.demoRate, icon: Monitor, color: "text-purple-400" },
    { label: "Show → Close", value: weekStats.closeRate, icon: CheckCircle2, color: "text-emerald-400" },
  ]

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Weekly Review</h1>
                <p className="text-white/40 text-sm mt-1">Sunday review · {formatWeek(currentWeekStart)}</p>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
              >
                {showHistory ? "Show Review" : "Past Weeks"}
              </button>
            </div>

            {!showHistory ? (
              <>
                {/* Auto-computed week stats */}
                <div className="card p-6 mb-4">
                  <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">This Week's Numbers</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                      <Phone size={16} className="text-blue-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">{weekStats.coldCalls}</div>
                      <div className="text-[10px] text-white/40">Total Calls</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                      <DoorOpen size={16} className="text-amber-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">{weekStats.gatekeepersPassed}</div>
                      <div className="text-[10px] text-white/40">Gatekeepers Passed</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                      <Monitor size={16} className="text-purple-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">{weekStats.demos}</div>
                      <div className="text-[10px] text-white/40">Demos Booked</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                      <Video size={16} className="text-rose-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">{weekStats.shows}</div>
                      <div className="text-[10px] text-white/40">Demos Held</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                      <CheckCircle2 size={16} className="text-emerald-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">{weekStats.closes}</div>
                      <div className="text-[10px] text-white/40">Closes</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {funnel.map(f => {
                      const Icon = f.icon
                      return (
                        <div key={f.label} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                          <Icon size={16} className={`${f.color} mx-auto mb-1`} />
                          <div className="text-lg font-bold text-white">{f.value}%</div>
                          <div className="text-[10px] text-white/40">{f.label}</div>
                        </div>
                      )
                    })}
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                      <TrendingUp size={16} className="text-sky-400 mx-auto mb-1" />
                      {weekStats.bestScript ? (
                        <>
                          <div className="text-lg font-bold text-white">{weekStats.bestScript.version}</div>
                          <div className="text-[10px] text-white/40">Best script · {weekStats.bestScript.closeRate}% close</div>
                        </>
                      ) : (
                        <>
                          <div className="text-lg font-bold text-white/30">—</div>
                          <div className="text-[10px] text-white/40">No script logged</div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-center text-[10px] text-white/30 mt-3">
                    {weekStats.days} day{weekStats.days !== 1 ? "s" : ""} logged · {weekStats.noShows} no-show{weekStats.noShows !== 1 ? "s" : ""} · {weekStats.noCloses} no-close{weekStats.noCloses !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Sunday form */}
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <CalendarCheck size={16} className="text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white">{editId ? "Edit Review" : "Sunday Review"}</h2>
                      <p className="text-xs text-white/40">{formatWeek(form.weekStart)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Script Changes Made (and why)</label>
                      <textarea
                        placeholder="e.g. Moved offer to earlier in V8 — V7 lost people at gatekeeper..."
                        value={form.scriptChanges}
                        onChange={e => updateField("scriptChanges", e.target.value)}
                        rows={2}
                        className="input-premium resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Leads Remaining in Charlotte List</label>
                      <input
                        type="number"
                        min={0}
                        value={form.leadsRemaining}
                        onChange={e => updateField("leadsRemaining", Math.max(0, parseInt(e.target.value) || 0))}
                        className="input-premium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-white/40 mb-1.5 block">Bugs Fixed</label>
                        <textarea
                          placeholder="dashboard, n8n, etc."
                          value={form.bugsFixed}
                          onChange={e => updateField("bugsFixed", e.target.value)}
                          rows={2}
                          className="input-premium resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 mb-1.5 block">Bugs Still Open</label>
                        <textarea
                          placeholder="known issues..."
                          value={form.bugsOpen}
                          onChange={e => updateField("bugsOpen", e.target.value)}
                          rows={2}
                          className="input-premium resize-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Hours Spent This Week</label>
                      <div className="grid grid-cols-3 gap-4">
                        {([
                          { key: "hoursSales" as const, label: "Sales" },
                          { key: "hoursTech" as const, label: "Tech" },
                          { key: "hoursCollege" as const, label: "College" },
                        ]).map(h => (
                          <div key={h.key}>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                value={form[h.key]}
                                onChange={e => updateField(h.key, Math.max(0, parseFloat(e.target.value) || 0))}
                                className="input-premium text-center"
                              />
                              <span className="text-xs text-white/40">{h.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Notes</label>
                      <textarea
                        placeholder="Anything else from the week..."
                        value={form.notes}
                        onChange={e => updateField("notes", e.target.value)}
                        rows={2}
                        className="input-premium resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.04]">
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
                        {editId ? "Update Review" : "Save Review"}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* History */
              <div className="card p-6">
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Past Weeks</h2>
                {sortedHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarCheck size={32} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">No reviews yet. Run your first Sunday review!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sortedHistory.map((review, i) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                          review.id === editId
                            ? "bg-purple-500/10 border border-purple-500/20"
                            : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]"
                        }`}
                        onClick={() => {
                          setForm(toForm(review))
                          setEditId(review.id)
                          setShowHistory(false)
                        }}
                      >
                        <div>
                          <div className="text-sm font-medium text-white/80">{formatWeek(review.weekStart)}</div>
                          <div className="text-xs text-white/40">
                            {review.hoursSales}h sales · {review.hoursTech}h tech · {review.hoursCollege}h college
                            {review.leadsRemaining > 0 && ` · ${review.leadsRemaining} leads left`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              setForm(toForm(review))
                              setEditId(review.id)
                              setShowHistory(false)
                            }}
                            className="p-1.5 rounded hover:bg-white/5 text-white/30 hover:text-purple-400 transition-colors"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              handleDelete(review.id)
                            }}
                            className="p-1.5 rounded hover:bg-white/5 text-white/20 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
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
