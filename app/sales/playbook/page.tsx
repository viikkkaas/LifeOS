"use client"

import { useState } from "react"
import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { getToday, generateId } from "@/lib/utils"
import { ScrollText, Plus, Trash2, Save, Bug, CheckCircle2, Circle, FileText, MessageSquareWarning, MonitorPlay, Workflow } from "lucide-react"
import type { BugItem, Playbook } from "@/types"

const DOC_SECTIONS = [
  { key: "objectionsDoc" as const, label: "Objection-Handling Doc", icon: MessageSquareWarning, placeholder: "How to handle price, timing, trust, already-have-solution objections..." },
  { key: "demoFlow" as const, label: "Demo Flow Steps", icon: MonitorPlay, placeholder: "1. Intro...\n2. Pain points...\n3. Solution walkthrough..." },
  { key: "n8nSummary" as const, label: "n8n Workflow Logic", icon: Workflow, placeholder: "Trigger → steps → actions. Summarize the automation logic here..." },
]

interface BugForm {
  title: string
  status: "Open" | "Fixed"
  detail: string
}

const emptyBugForm = (): BugForm => ({ title: "", status: "Open", detail: "" })

export default function PlaybookPage() {
  const { state, dispatch } = useApp()
  const { playbook } = state.data

  const [selectedVersion, setSelectedVersion] = useState<string | null>(
    playbook.scriptVersions.length > 0 ? playbook.scriptVersions[playbook.scriptVersions.length - 1].version : null
  )
  const [newVersion, setNewVersion] = useState("")
  const [scriptDraft, setScriptDraft] = useState("")
  const [scriptSaved, setScriptSaved] = useState(false)

  const [docDrafts, setDocDrafts] = useState<Record<string, string>>({})
  const [docSaved, setDocSaved] = useState<Record<string, boolean>>({})

  const [bugForm, setBugForm] = useState<BugForm>(emptyBugForm())
  const [editBugId, setEditBugId] = useState<string | null>(null)
  const [showBugForm, setShowBugForm] = useState(false)

  const selectVersion = (version: string) => {
    setSelectedVersion(version)
    const found = playbook.scriptVersions.find(v => v.version === version)
    setScriptDraft(found?.content ?? "")
    setScriptSaved(false)
  }

  const saveScript = () => {
    if (!selectedVersion) return
    dispatch({ type: "SAVE_SCRIPT_VERSION", payload: { version: selectedVersion, content: scriptDraft } })
    setScriptSaved(true)
    setTimeout(() => setScriptSaved(false), 1500)
  }

  const addVersion = () => {
    const version = newVersion.trim()
    if (!version) return
    if (playbook.scriptVersions.some(v => v.version === version)) {
      selectVersion(version)
      setNewVersion("")
      return
    }
    dispatch({ type: "SAVE_SCRIPT_VERSION", payload: { version, content: "" } })
    setNewVersion("")
    selectVersion(version)
  }

  const deleteVersion = (version: string) => {
    dispatch({ type: "DELETE_SCRIPT_VERSION", payload: version })
    if (selectedVersion === version) {
      const remaining = playbook.scriptVersions.filter(v => v.version !== version)
      if (remaining.length > 0) {
        selectVersion(remaining[remaining.length - 1].version)
      } else {
        setSelectedVersion(null)
        setScriptDraft("")
      }
    }
  }

  const saveDoc = (key: typeof DOC_SECTIONS[number]["key"], value: string) => {
    dispatch({ type: "UPDATE_PLAYBOOK", payload: { [key]: value } as Partial<Playbook> })
    setDocSaved(prev => ({ ...prev, [key]: true }))
    setTimeout(() => setDocSaved(prev => ({ ...prev, [key]: false })), 1500)
  }

  const openAddBug = () => {
    setBugForm(emptyBugForm())
    setEditBugId(null)
    setShowBugForm(true)
  }

  const openEditBug = (bug: BugItem) => {
    setBugForm({ title: bug.title, status: bug.status, detail: bug.detail })
    setEditBugId(bug.id)
    setShowBugForm(true)
  }

  const saveBug = () => {
    if (!bugForm.title.trim()) return
    if (editBugId) {
      dispatch({
        type: "UPDATE_BUG",
        payload: { ...bugForm, id: editBugId, date: playbook.bugs.find(b => b.id === editBugId)?.date ?? getToday() } as BugItem,
      })
    } else {
      dispatch({
        type: "ADD_BUG",
        payload: { ...bugForm, id: generateId(), date: getToday() } as BugItem,
      })
    }
    setBugForm(emptyBugForm())
    setEditBugId(null)
    setShowBugForm(false)
  }

  const deleteBug = (id: string) => {
    dispatch({ type: "DELETE_BUG", payload: id })
    if (editBugId === id) {
      setBugForm(emptyBugForm())
      setEditBugId(null)
      setShowBugForm(false)
    }
  }

  const toggleBugStatus = (bug: BugItem) => {
    dispatch({
      type: "UPDATE_BUG",
      payload: { ...bug, status: bug.status === "Open" ? "Fixed" : "Open" },
    })
  }

  const sortedBugs = [...playbook.bugs].sort((a, b) => {
    if (a.status !== b.status) return a.status === "Open" ? -1 : 1
    return b.date.localeCompare(a.date)
  })

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Playbook</h1>
                <p className="text-white/40 text-sm mt-1">Scripts, objections, demo flow, n8n logic, bug log</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Script versions */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={14} className="text-sky-400" />
                  <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Current Script (versioned)</h2>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <input
                    value={newVersion}
                    onChange={e => setNewVersion(e.target.value)}
                    placeholder="New version (e.g. V8)"
                    className="input-premium"
                  />
                  <button
                    onClick={addVersion}
                    className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] px-3 py-2 rounded-lg hover:opacity-90 transition-opacity shrink-0"
                  >
                    <Plus size={13} />
                    Add
                  </button>
                </div>

                {playbook.scriptVersions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText size={28} className="text-white/10 mx-auto mb-2" />
                    <p className="text-white/30 text-sm">No script versions yet. Add V1 and start iterating.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {playbook.scriptVersions.map(v => (
                      <div key={v.version} className="flex items-center gap-1">
                        <button
                          onClick={() => selectVersion(v.version)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            selectedVersion === v.version
                              ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                              : "bg-white/[0.03] border border-white/[0.06] text-white/60 hover:text-white/80"
                          }`}
                        >
                          {v.version}
                        </button>
                        <button
                          onClick={() => deleteVersion(v.version)}
                          className="p-1 rounded hover:bg-white/5 text-white/20 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedVersion && (
                  <>
                    <textarea
                      value={scriptDraft}
                      onChange={e => setScriptDraft(e.target.value)}
                      rows={14}
                      placeholder={`Full ${selectedVersion} script text...`}
                      className="input-premium resize-y font-mono text-xs"
                    />
                    <div className="flex items-center justify-end mt-3">
                      <button
                        onClick={saveScript}
                        className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <Save size={13} />
                        {scriptSaved ? "Saved ✓" : "Save Script"}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Docs */}
              <div className="space-y-4">
                {DOC_SECTIONS.map(section => {
                  const Icon = section.icon
                  return (
                    <div key={section.key} className="card p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Icon size={14} className="text-purple-400" />
                        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">{section.label}</h2>
                      </div>
                      <textarea
                        value={docDrafts[section.key] ?? playbook[section.key]}
                        onChange={e => setDocDrafts(prev => ({ ...prev, [section.key]: e.target.value }))}
                        placeholder={section.placeholder}
                        rows={5}
                        className="input-premium resize-y"
                      />
                      <div className="flex items-center justify-end mt-3">
                        <button
                          onClick={() => saveDoc(section.key, docDrafts[section.key] ?? playbook[section.key])}
                          className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                        >
                          <Save size={13} />
                          {docSaved[section.key] ? "Saved ✓" : "Save"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bug log */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bug size={14} className="text-amber-400" />
                  <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Known Bugs + Fixes</h2>
                </div>
                <button
                  onClick={openAddBug}
                  className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus size={13} />
                  Log Bug
                </button>
              </div>

              {showBugForm && (
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.04] mb-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      value={bugForm.title}
                      onChange={e => setBugForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Bug title"
                      className="input-premium"
                    />
                    <select
                      value={bugForm.status}
                      onChange={e => setBugForm(prev => ({ ...prev, status: e.target.value as BugItem["status"] }))}
                      className="select-premium"
                    >
                      <option value="Open">Open</option>
                      <option value="Fixed">Fixed</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveBug}
                        disabled={!bugForm.title.trim()}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] px-3 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                      >
                        <Save size={13} />
                        {editBugId ? "Update" : "Add"}
                      </button>
                      <button
                        onClick={() => { setBugForm(emptyBugForm()); setEditBugId(null); setShowBugForm(false) }}
                        className="text-xs text-white/40 hover:text-white/70 px-3 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={bugForm.detail}
                    onChange={e => setBugForm(prev => ({ ...prev, detail: e.target.value }))}
                    placeholder="What broke, how it was (or will be) fixed..."
                    rows={2}
                    className="input-premium resize-none"
                  />
                </div>
              )}

              {sortedBugs.length === 0 ? (
                <div className="text-center py-8">
                  <Bug size={28} className="text-white/10 mx-auto mb-2" />
                  <p className="text-white/30 text-sm">No bugs logged. Keep it that way.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedBugs.map(bug => (
                    <div key={bug.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => toggleBugStatus(bug)}
                          title={bug.status === "Open" ? "Mark fixed" : "Reopen"}
                          className="mt-0.5 shrink-0"
                        >
                          {bug.status === "Fixed" ? (
                            <CheckCircle2 size={16} className="text-emerald-400" />
                          ) : (
                            <Circle size={16} className="text-amber-400" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-medium ${bug.status === "Fixed" ? "text-white/50 line-through" : "text-white/80"}`}>
                              {bug.title}
                            </span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${bug.status === "Fixed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                              {bug.status}
                            </span>
                          </div>
                          {bug.detail && <div className="text-xs text-white/40 mt-1">{bug.detail}</div>}
                          <div className="text-[10px] text-white/25 mt-1">{bug.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditBug(bug)}
                          className="p-1.5 rounded hover:bg-white/5 text-white/30 hover:text-purple-400 transition-colors"
                        >
                          <ScrollText size={12} />
                        </button>
                        <button
                          onClick={() => deleteBug(bug.id)}
                          className="p-1.5 rounded hover:bg-white/5 text-white/20 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}