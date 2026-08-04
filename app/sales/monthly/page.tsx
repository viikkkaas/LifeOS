"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { getToday, generateId } from "@/lib/utils"
import { CalendarDays, Save, Trash2, X, Target, TrendingUp } from "lucide-react"
import type { MonthlyCheckpoint, CollegeStatus, Client } from "@/types"

const COLLEGE_OPTIONS: CollegeStatus[] = ["Passing", "At Risk", "Clear"]

const COLLEGE_META: Record<CollegeStatus, { label: string; color: string; bg: string }> = {
  Passing: { label: "Passing", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  "At Risk": { label: "At Risk", color: "text-rose-400", bg: "bg-rose-500/10" },
  Clear: { label: "Clear", color: "text-sky-400", bg: "bg-sky-500/10" },
}

const TARGETS = [
  { label: "Aug '26", month: "2026-08", count: 1 },
  { label: "Oct '26", month: "2026-10", count: 3 },
  { label: "Dec '26", month: "2026-12", count: 5 },
]

const currentMonth = () => getToday().slice(0, 7)

interface CheckpointForm {
  month: string
  mrrTotal: number
  churn: number
  collegeStatus: CollegeStatus
  notes: string
}

const emptyForm = (): CheckpointForm => ({
  month: currentMonth(),
  mrrTotal: 0,
  churn: 0,
  collegeStatus: "Clear",
  notes: "",
})

const toForm = (c: MonthlyCheckpoint): CheckpointForm => ({
  month: c.month,
  mrrTotal: c.mrrTotal,
  churn: c.churn,
  collegeStatus: c.collegeStatus,
  notes: c.notes,
})

function clientsSignedBy(clientList: Client[], throughMonth: string): number {
  const limit = `${throughMonth}-31`
  return clientList.filter(c => c.closeDate && c.closeDate.slice(0, 7) <= throughMonth).length
}

function clientCountForMonth(clientList: Client[], month: string): number {
  return clientList.filter(c => c.closeDate && c.closeDate.slice(0, 7) === month).length
}

export default function MonthlyCheckpointsPage() {
  const { state, dispatch } = useApp()
  const { monthlyCheckpoints = [], clients = [] } = state.data
  const thisMonth = currentMonth()

  const totalMrrFromClients = useMemo(() => clients.reduce((s, c) => s + c.mrr, 0), [clients])
  const thisMonthCount = useMemo(() => clientCountForMonth(clients, thisMonth), [clients, thisMonth])

  const currentCheckpoint = monthlyCheckpoints.find(m => m.month === thisMonth)
  const [editId, setEditId] = useState<string | null>(currentCheckpoint?.id ?? null)
  const [form, setForm] = useState<CheckpointForm>(
    currentCheckpoint ? toForm(currentCheckpoint) : { ...emptyForm(), mrrTotal: totalMrrFromClients }
  )
  const [showHistory, setShowHistory] = useState(false)

  const updateField = (key: keyof CheckpointForm, value: string | number | CollegeStatus) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    if (editId) {
      dispatch({
        type: "UPDATE_MONTHLY_CHECKPOINT",
        payload: { ...form, id: editId, createdAt: monthlyCheckpoints.find(m => m.id === editId)?.createdAt ?? new Date().toISOString() } as MonthlyCheckpoint,
      })
    } else {
      dispatch({
        type: "ADD_MONTHLY_CHECKPOINT",
        payload: { ...form, id: generateId(), createdAt: new Date().toISOString() } as MonthlyCheckpoint,
      })
      setEditId(currentCheckpoint?.id ?? null)
    }
  }

  const handleDelete = (id: string) => {
    dispatch({ type: "DELETE_MONTHLY_CHECKPOINT", payload: id })
    if (editId === id) resetForm()
  }

  const resetForm = () => {
    setForm({ ...emptyForm(), mrrTotal: totalMrrFromClients })
    setEditId(null)
  }

  const sortedHistory = useMemo(() => {
    return [...monthlyCheckpoints].sort((a, b) => b.month.localeCompare(a.month))
  }, [monthlyCheckpoints])

  const formatMonth = (month: string) => {
    const d = new Date(`${month}-01T00:00:00`)
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Monthly Checkpoints</h1>
                <p className="text-white/40 text-sm mt-1">Progress vs targets · MRR · churn · college</p>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
              >
                {showHistory ? "Show Checkpoint" : "Past Months"}
              </button>
            </div>

            {!showHistory ? (
              <>
                {/* Live targets */}
                <div className="card p-6 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Target size={14} className="text-purple-400" />
                    <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Targets</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {TARGETS.map(target => {
                      const signed = clientsSignedBy(clients, target.month)
                      const done = signed >= target.count
                      const pct = Math.min(Math.round((signed / target.count) * 100), 100)
                      return (
                        <div key={target.month} className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-white">{target.label}</span>
                            <span className={`text-xs font-bold ${done ? "text-emerald-400" : "text-white/50"}`}>
                              {signed}/{target.count} {done && "✓"}
                            </span>
                          </div>
                          <div className="progress-bar h-1.5">
                            <div className={`progress-bar-fill ${done ? "green" : ""}`} style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-[10px] text-white/30 mt-2">
                            {target.label === "Aug '26" ? "1 client" : target.label === "Oct '26" ? "3 clients" : "5+ clients"}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 flex items-center gap-2 text-xs text-white/60">
                    <TrendingUp size={13} className="text-purple-400" />
                    <span>
                      {thisMonthCount} signed this month · <span className="text-white/80">{clients.length} total clients</span> ·{" "}
                      <span className="text-white/80">${totalMrrFromClients.toLocaleString()} MRR</span> from client list
                    </span>
                  </div>
                </div>

                {/* Monthly checkpoint form */}
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <CalendarDays size={16} className="text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white">{editId ? "Edit Checkpoint" : "This Month's Checkpoint"}</h2>
                      <p className="text-xs text-white/40">{formatMonth(form.month)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Month</label>
                      <input
                        type="month"
                        value={form.month}
                        onChange={e => updateField("month", e.target.value)}
                        className="input-premium"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">MRR Total ($)</label>
                      <input
                        type="number"
                        min={0}
                        value={form.mrrTotal}
                        onChange={e => updateField("mrrTotal", Math.max(0, parseFloat(e.target.value) || 0))}
                        className="input-premium"
                      />
                      <div className="text-[10px] text-white/30 mt-1">Auto-filled from clients · editable</div>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Churn</label>
                      <input
                        type="number"
                        min={0}
                        value={form.churn}
                        onChange={e => updateField("churn", Math.max(0, parseFloat(e.target.value) || 0))}
                        className="input-premium"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs text-white/40 mb-1.5 block">College Status</label>
                    <select
                      value={form.collegeStatus}
                      onChange={e => updateField("collegeStatus", e.target.value as CollegeStatus)}
                      className="select-premium w-full sm:w-64"
                    >
                      {COLLEGE_OPTIONS.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs text-white/40 mb-1.5 block">Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={e => updateField("notes", e.target.value)}
                      placeholder="Anything on fire? College status, churn context..."
                      rows={2}
                      className="input-premium resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-white/[0.04]">
                    {editId && (
                      <>
                        <button
                          onClick={() => handleDelete(editId)}
                          className="flex items-center gap-1.5 text-xs text-rose-400/60 hover:text-rose-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-500/5"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                        <button
                          onClick={resetForm}
                          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                        >
                          <X size={12} />
                          Reset
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <Save size={14} />
                      {editId ? "Update Checkpoint" : "Save Checkpoint"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* History */
              <div className="card p-6">
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Past Checkpoints</h2>
                {sortedHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDays size={32} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">No checkpoints yet. Run your first monthly review!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sortedHistory.map((checkpoint, i) => {
                      const meta = COLLEGE_META[checkpoint.collegeStatus]
                      return (
                        <motion.div
                          key={checkpoint.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                            checkpoint.id === editId
                              ? "bg-purple-500/10 border border-purple-500/20"
                              : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]"
                          }`}
                          onClick={() => {
                            setForm(toForm(checkpoint))
                            setEditId(checkpoint.id)
                            setShowHistory(false)
                          }}
                        >
                          <div>
                            <div className="text-sm font-medium text-white/80">{formatMonth(checkpoint.month)}</div>
                            <div className="text-xs text-white/40">
                              ${checkpoint.mrrTotal.toLocaleString()} MRR
                              {checkpoint.churn > 0 && <span className="text-rose-400/70"> · {checkpoint.churn} churned</span>}
                              {checkpoint.notes && <span> · {checkpoint.notes}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                              {meta.label}
                            </span>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                handleDelete(checkpoint.id)
                              }}
                              className="p-1.5 rounded hover:bg-white/5 text-white/20 hover:text-rose-400 transition-colors"
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