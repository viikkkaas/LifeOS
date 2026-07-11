"use client"

import { useState } from "react"
import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { getToday, generateId } from "@/lib/utils"
import { Plus, Trash2, Edit3 } from "lucide-react"
import type { JournalEntry } from "@/types"
import toast from "react-hot-toast"

export default function JournalPage() {
  const { state, dispatch } = useApp()
  const { journal } = state.data
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<JournalEntry | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [wins, setWins] = useState("")
  const [losses, setLosses] = useState("")
  const [ideas, setIdeas] = useState("")
  const [lessons, setLessons] = useState("")

  const resetForm = () => {
    setTitle(""); setContent(""); setWins(""); setLosses(""); setIdeas(""); setLessons("")
    setEditing(null); setShowForm(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { toast.error("Title is required"); return }

    if (editing) {
      dispatch({
        type: "UPDATE_JOURNAL",
        payload: { ...editing, title, content, wins, losses, ideas, lessons }
      })
      toast.success("Entry updated")
    } else {
      const entry: JournalEntry = {
        id: generateId(), date: getToday(), title, content,
        wins, losses, ideas, lessons, createdAt: new Date().toISOString(),
      }
      dispatch({ type: "ADD_JOURNAL", payload: entry })
      toast.success("Journal entry added")
    }
    resetForm()
  }

  const editEntry = (entry: JournalEntry) => {
    setEditing(entry)
    setTitle(entry.title); setContent(entry.content)
    setWins(entry.wins); setLosses(entry.losses)
    setIdeas(entry.ideas); setLessons(entry.lessons)
    setShowForm(true)
  }

  const deleteEntry = (id: string) => {
    dispatch({ type: "DELETE_JOURNAL", payload: id })
    toast.success("Entry deleted")
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white">Journal</h1>
                <p className="text-white/40 text-sm mt-1">Track your daily wins, ideas, and lessons</p>
              </div>
              <button onClick={() => { resetForm(); setShowForm(!showForm) }} className="btn-premium flex items-center gap-2">
                <Plus size={16} /> New Entry
              </button>
            </div>

            {/* Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <form onSubmit={handleSubmit} className="card p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                      {editing ? "Edit Entry" : "New Entry"}
                    </h3>
                    <input className="input-premium" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
                    <textarea className="input-premium min-h-[100px] resize-none" placeholder="How was your day?" value={content} onChange={e => setContent(e.target.value)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input className="input-premium" placeholder="🌟 Wins" value={wins} onChange={e => setWins(e.target.value)} />
                      <input className="input-premium" placeholder="💪 Losses / Challenges" value={losses} onChange={e => setLosses(e.target.value)} />
                      <input className="input-premium" placeholder="💡 Ideas" value={ideas} onChange={e => setIdeas(e.target.value)} />
                      <input className="input-premium" placeholder="📚 Lessons Learned" value={lessons} onChange={e => setLessons(e.target.value)} />
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={resetForm} className="btn-ghost flex-1">Cancel</button>
                      <button type="submit" className="btn-premium flex-1">{editing ? "Update" : "Save Entry"}</button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Entries */}
            <div className="space-y-3">
              {journal.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-white/40 text-sm">No journal entries yet. Start writing!</p>
                </div>
              ) : (
                journal.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="card p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-sm text-white">{entry.title}</h3>
                        <span className="text-[10px] text-white/30">{new Date(entry.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => editEntry(entry)} className="p-1.5 rounded hover:bg-white/5 text-white/30 hover:text-white/70">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => deleteEntry(entry.id)} className="p-1.5 rounded hover:bg-red-500/10 text-white/30 hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {entry.content && <p className="text-xs text-white/50 mb-3 leading-relaxed">{entry.content}</p>}
                    <div className="flex flex-wrap gap-2">
                      {entry.wins && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">🌟 {entry.wins}</span>}
                      {entry.ideas && <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300">💡 {entry.ideas}</span>}
                      {entry.lessons && <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">📚 {entry.lessons}</span>}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
