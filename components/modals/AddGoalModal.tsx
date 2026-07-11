"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import type { Goal, GoalCategory, Priority, GoalTag } from "@/types"
import { generateId } from "@/lib/utils"
import toast from "react-hot-toast"

interface AddGoalModalProps {
  onClose: () => void
  dispatch: any
}

const categories: GoalCategory[] = [
  "Apple Ecosystem", "Vehicles", "Real Estate", "Travel",
  "Gifts", "Business", "Technology", "Personal Goals", "Investments"
]

const priorities: Priority[] = ["Low", "Medium", "High", "Critical"]
const tags: GoalTag[] = ["Need", "Want", "Luxury", "Gift"]

export default function AddGoalModal({ onClose, dispatch }: AddGoalModalProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState<GoalCategory>("Personal Goals")
  const [targetPrice, setTargetPrice] = useState("")
  const [amountSaved, setAmountSaved] = useState("0")
  const [priority, setPriority] = useState<Priority>("Medium")
  const [targetYear, setTargetYear] = useState(String(new Date().getFullYear() + 1))
  const [notes, setNotes] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [why, setWhy] = useState("")
  const [selectedTags, setSelectedTags] = useState<GoalTag[]>([])
  const [recurringSaving, setRecurringSaving] = useState("0")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error("Name is required"); return }
    const price = Number(targetPrice)
    if (!price || price <= 0) { toast.error("Enter a valid price"); return }

    const goal: Goal = {
      id: generateId(),
      name: name.trim(),
      category,
      targetPrice: price,
      amountSaved: Number(amountSaved) || 0,
      priority,
      targetYear: Number(targetYear),
      purchased: false,
      purchaseDate: null,
      notes,
      imageUrl,
      tags: selectedTags,
      why,
      images: imageUrl ? [imageUrl] : [],
      recurringSaving: Number(recurringSaving) || 0,
      recurringFrequency: Number(recurringSaving) > 0 ? "Monthly" : "None",
      deposits: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 0,
      locked: false,
    }

    dispatch({ type: "ADD_GOAL", payload: goal })
    toast.success("Goal added! 🎯")
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
            <h2 className="text-lg font-semibold text-white">Add New Goal</h2>
            <button onClick={onClose} className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-white/70">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Name *</label>
              <input className="input-premium" placeholder="Enter goal name" value={name} onChange={e => setName(e.target.value)} />
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
                <label className="text-xs text-white/40 mb-1.5 block">Target Price *</label>
                <input className="input-premium" type="number" placeholder="100000" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Amount Saved</label>
                <input className="input-premium" type="number" placeholder="0" value={amountSaved} onChange={e => setAmountSaved(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Target Year</label>
                <input className="input-premium" type="number" value={targetYear} onChange={e => setTargetYear(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Monthly Recurring Saving</label>
                <input className="input-premium" type="number" placeholder="0" value={recurringSaving} onChange={e => setRecurringSaving(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Why is this important?</label>
              <input className="input-premium" placeholder="Your motivation..." value={why} onChange={e => setWhy(e.target.value)} />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Image URL (optional)</label>
              <input className="input-premium" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
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
              <textarea className="input-premium min-h-[80px] resize-none" placeholder="Any notes..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" className="btn-premium flex-1">Add Goal</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
