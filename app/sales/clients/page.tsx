"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { getToday, generateId } from "@/lib/utils"
import { Users, Plus, Save, Pencil, Trash2, X, BadgeCheck, XCircle, Clock } from "lucide-react"
import type { Client, OnboardingStatus } from "@/types"

const ONBOARDING_OPTIONS: OnboardingStatus[] = ["Pending", "Delivered", "Overdue"]

const ONBOARDING_META: Record<OnboardingStatus, { label: string; color: string; bg: string }> = {
  Pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10" },
  Delivered: { label: "Delivered", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  Overdue: { label: "Overdue", color: "text-rose-400", bg: "bg-rose-500/10" },
}

interface ClientForm {
  name: string
  clinic: string
  closeDate: string
  setupFee: number
  mrr: number
  onboardingStatus: OnboardingStatus
  caseStudyRights: boolean
  issues: string
}

const emptyForm = (): ClientForm => ({
  name: "",
  clinic: "",
  closeDate: getToday(),
  setupFee: 0,
  mrr: 0,
  onboardingStatus: "Pending",
  caseStudyRights: false,
  issues: "",
})

const toForm = (c: Client): ClientForm => ({
  name: c.name,
  clinic: c.clinic,
  closeDate: c.closeDate,
  setupFee: c.setupFee,
  mrr: c.mrr,
  onboardingStatus: c.onboardingStatus,
  caseStudyRights: c.caseStudyRights,
  issues: c.issues,
})

export default function ClientsPage() {
  const { state, dispatch } = useApp()
  const { clients = [] } = state.data

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<ClientForm>(emptyForm())

  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime())
  }, [clients])

  const updateField = (key: keyof ClientForm, value: string | number | boolean | OnboardingStatus) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const openAdd = () => {
    setForm(emptyForm())
    setEditId(null)
    setShowForm(true)
  }

  const openEdit = (c: Client) => {
    setForm(toForm(c))
    setEditId(c.id)
    setShowForm(true)
  }

  const resetAndClose = () => {
    setForm(emptyForm())
    setEditId(null)
    setShowForm(false)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editId) {
      dispatch({
        type: "UPDATE_CLIENT",
        payload: { ...form, id: editId, createdAt: clients.find(c => c.id === editId)?.createdAt ?? new Date().toISOString() } as Client,
      })
    } else {
      dispatch({
        type: "ADD_CLIENT",
        payload: { ...form, id: generateId(), createdAt: new Date().toISOString() } as Client,
      })
    }
    resetAndClose()
  }

  const handleDelete = (id: string) => {
    dispatch({ type: "DELETE_CLIENT", payload: id })
    if (editId === id) resetAndClose()
  }

  const totalMrr = clients.reduce((s, c) => s + c.mrr, 0)
  const totalSetup = clients.reduce((s, c) => s + c.setupFee, 0)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Clients</h1>
                <p className="text-white/40 text-sm mt-1">Track signed clients, onboarding, and post-launch issues</p>
              </div>
              <button
                onClick={openAdd}
                className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus size={14} />
                Add Client
              </button>
            </div>

            {clients.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="card p-4">
                  <div className="text-xs text-white/40 mb-1">Total Clients</div>
                  <div className="text-xl font-bold text-white">{clients.length}</div>
                </div>
                <div className="card p-4">
                  <div className="text-xs text-white/40 mb-1">Monthly MRR</div>
                  <div className="text-xl font-bold text-white">${totalMrr.toLocaleString()}</div>
                </div>
                <div className="card p-4">
                  <div className="text-xs text-white/40 mb-1">Total Setup Fees</div>
                  <div className="text-xl font-bold text-white">${totalSetup.toLocaleString()}</div>
                </div>
                <div className="card p-4">
                  <div className="text-xs text-white/40 mb-1">Delivered (7-day)</div>
                  <div className="text-xl font-bold text-white">{clients.filter(c => c.onboardingStatus === "Delivered").length}</div>
                </div>
              </div>
            )}

            {showForm && (
              <div className="card p-6 mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Users size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">{editId ? "Edit Client" : "New Client"}</h2>
                    <p className="text-xs text-white/40">Fill in the details and save</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Client Name *</label>
                    <input
                      value={form.name}
                      onChange={e => updateField("name", e.target.value)}
                      placeholder="e.g. Dr. Smith"
                      className="input-premium"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Clinic</label>
                    <input
                      value={form.clinic}
                      onChange={e => updateField("clinic", e.target.value)}
                      placeholder="Clinic name"
                      className="input-premium"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Close Date</label>
                    <input
                      type="date"
                      value={form.closeDate}
                      onChange={e => updateField("closeDate", e.target.value)}
                      className="input-premium"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Setup Fee ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.setupFee}
                      onChange={e => updateField("setupFee", Math.max(0, parseFloat(e.target.value) || 0))}
                      className="input-premium"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">MRR Value ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.mrr}
                      onChange={e => updateField("mrr", Math.max(0, parseFloat(e.target.value) || 0))}
                      className="input-premium"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Onboarding Status</label>
                    <select
                      value={form.onboardingStatus}
                      onChange={e => updateField("onboardingStatus", e.target.value as OnboardingStatus)}
                      className="select-premium w-full"
                    >
                      {ONBOARDING_OPTIONS.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.caseStudyRights}
                    onChange={e => updateField("caseStudyRights", e.target.checked)}
                    className="accent-[#667eea]"
                  />
                  <span className="text-sm text-white/70">Case study rights confirmed</span>
                </label>

                <div className="mt-4">
                  <label className="text-xs text-white/40 mb-1.5 block">Issues / Tickets Post-Launch</label>
                  <textarea
                    value={form.issues}
                    onChange={e => updateField("issues", e.target.value)}
                    placeholder="Any issues or tickets raised..."
                    rows={2}
                    className="input-premium resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-white/[0.04]">
                  <button
                    onClick={resetAndClose}
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                  >
                    <X size={12} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!form.name.trim()}
                    className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Save size={14} />
                    {editId ? "Update Client" : "Save Client"}
                  </button>
                </div>
              </div>
            )}

            {sortedClients.length === 0 ? (
              <div className="card p-6">
                <div className="text-center py-12">
                  <Users size={32} className="text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">No clients yet. Add your first signed client!</p>
                  <button onClick={openAdd} className="btn-ghost mt-4">Add Client</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedClients.map((c, i) => {
                  const meta = ONBOARDING_META[c.onboardingStatus]
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="card p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm font-semibold text-white">{c.name}</div>
                          <div className="text-xs text-white/40">{c.clinic || "—"}</div>
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                          {meta.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                        {c.onboardingStatus === "Delivered" ? (
                          <BadgeCheck size={12} className="text-emerald-400" />
                        ) : c.onboardingStatus === "Overdue" ? (
                          <XCircle size={12} className="text-rose-400" />
                        ) : (
                          <Clock size={12} className="text-amber-400" />
                        )}
                        <span>Closed {new Date(c.closeDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <div className="text-[10px] text-white/40">Setup Fee</div>
                          <div className="text-sm font-bold text-white">${c.setupFee.toLocaleString()}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <div className="text-[10px] text-white/40">MRR</div>
                          <div className="text-sm font-bold text-white">${c.mrr.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-white/40">Case study rights</span>
                        <span className={c.caseStudyRights ? "text-emerald-400" : "text-white/30"}>
                          {c.caseStudyRights ? "Confirmed" : "No"}
                        </span>
                      </div>

                      {c.issues && (
                        <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs text-amber-200/70 mb-2">
                          ⚠ {c.issues}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-white/[0.04]">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded hover:bg-white/5 text-white/30 hover:text-purple-400 transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded hover:bg-white/5 text-white/20 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}