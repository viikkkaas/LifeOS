"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import type { Goal, GoalCategory, Priority, GoalTag } from "@/types"
import toast from "react-hot-toast"

interface EditGoalModalProps {
  goal: Goal
  onClose: () => void
  dispatch: any
}

const categories: GoalCategory[] = [
  "Apple Ecosystem", "Vehicles", "Real Estate", "Travel",
  "Gifts", "Business", "Technology", "Personal Goals", "Investments"
]

const priorities: Priority[] = ["Low", "Medium", "High", "Critical"]
const tags: GoalTag[] = ["Need", "Want", "Luxury", "Gift"]

export default function EditGoalModal({ goal, onClose, dispatch }: EditGoalModalProps) {
  const [name, setName] = useState(goal.name)
  const [category, setCategory] = useState<GoalCategory>(goal.category)
  const [targetPrice, setTargetPrice] = useState(String(goal.targetPrice))
  const [amountSaved, setAmountSaved] = useState(String(goal.amountSaved))
  const [priority, setPriority] = useState<Priority>(goal.priority)
  const [targetYear, setTargetYear] = useState(String(goal.targetYear))
  const [notes, setNotes] = useState(goal.notes)
  const [imageUrl, setImageUrl] = useState(goal.imageUrl)
  const [why, setWhy] = useState(goal.why)
  const [selectedTags, setSelectedTags] = useState<GoalTag[]>(goal.tags)
  const [recurringSaving, setRecurringSaving] = useState(String(goal.recurringSaving))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error("Name is required"); return }
    const price = Number(targetPrice)
    if (!price || price <= 0) { toast.error("Enter a valid price"); return }

    const updated: Goal = {
      ...goal,
      name: name.trim(),
      category,
      targetPrice: price,
      amountSaved: Number(amountSaved) || 0,
      priority,
      targetYear: Number(targetYear),
      notes,
      imageUrl,
      tags: selectedTags,
      why,
      images: imageUrl ? [imageUrl] : goal.images,
      recurringSaving: Number(recurringSaving) || 0,
      recurringFrequency: Number(recurringSaving) > 0 ? "Monthly" : "None",
      updatedAt: new Date().toISOString(),
    }

    dispatch({ type: "UPDATE_GOAL", payload: updated })
    toast.success("Goal updated!")
    onClose()
  }

  const toggleTag = (tag: GoalTag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
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
          className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Edit Goal</h2>
            <button onClick={onClose} className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-white/70">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Name *</label>
              <input className="input-premium" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Category</label>
                <select className="select-premium w-full" value={category} onChange={e => setCategory(e.target.value as GoalCategory)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Priority</label>
                <select className="select-premium w-full" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Target Price</label>
                <input className="input-premium" type="number" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Amount Saved</label>
                <input className="input-premium" type="number" value={amountSaved} onChange={e => setAmountSaved(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Target Year</label>
                <input className="input-premium" type="number" value={targetYear} onChange={e => setTargetYear(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Recurring Saving</label>
                <input className="input-premium" type="number" value={recurringSaving} onChange={e => setRecurringSaving(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Why is this important?</label>
              <input className="input-premium" value={why} onChange={e => setWhy(e.target.value)} placeholder="Your motivation..." />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Image URL</label>
              <input className="input-premium" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Tags</label>
              <div className="flex gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-white/5 text-white/40 border border-transparent hover:text-white/60"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Notes</label>
              <textarea className="input-premium min-h-[80px] resize-none" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" className="btn-premium flex-1">Save Changes</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
