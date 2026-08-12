"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import type { Habit } from "@/types"
import { generateId } from "@/lib/utils"
import toast from "react-hot-toast"

const EMOJIS = [
  "💪", "📞", "💼", "📚", "💻", "🧘", "🌅", "💧",
  "😴", "✍️", "🥗", "📧", "🎓", "📊", "🏃", "🏋️",
  "🧠", "🍎", "🎯", "🤝", "💰", "📅", "🚶", "🚭",
]

interface AddHabitModalProps {
  onClose: () => void
  dispatch: any
  habit?: Habit | null
}

export default function AddHabitModal({ onClose, dispatch, habit }: AddHabitModalProps) {
  const [name, setName] = useState(habit?.name || "")
  const [icon, setIcon] = useState(habit?.icon || "💪")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error("Habit name is required"); return }

    if (habit) {
      dispatch({ type: "UPDATE_HABIT", payload: { ...habit, name: name.trim(), icon } })
      toast.success("Habit updated ✏️")
    } else {
      const newHabit: Habit = {
        id: generateId(),
        name: name.trim(),
        icon,
        streak: 0,
        lastCheckin: null,
        logs: [],
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: "ADD_HABIT", payload: newHabit })
      toast.success("Habit added! ✅")
    }
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="card w-full max-w-md p-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">{habit ? "Edit Habit" : "Add New Habit"}</h2>
            <button onClick={onClose} className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-white/70">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Name *</label>
              <input
                className="input-premium"
                placeholder="e.g. Journaling / Planning"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Icon</label>
              <div className="grid grid-cols-8 gap-1.5">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setIcon(e)}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                      icon === e
                        ? "bg-purple-500/20 border border-purple-500/40 scale-110"
                        : "bg-white/5 border border-transparent hover:bg-white/10"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" className="btn-premium flex-1">{habit ? "Save Changes" : "Add Habit"}</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}