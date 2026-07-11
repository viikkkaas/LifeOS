"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { generateId, getToday } from "@/lib/utils"
import toast from "react-hot-toast"

interface AddDepositModalProps {
  goalId: string
  onClose: () => void
  dispatch: any
}

export default function AddDepositModal({ goalId, onClose, dispatch }: AddDepositModalProps) {
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number(amount)
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return }

    dispatch({
      type: "ADD_DEPOSIT",
      payload: {
        goalId,
        deposit: {
          id: generateId(),
          date: getToday(),
          amount: amt,
          note: note.trim(),
        }
      }
    })
    toast.success(`Deposit of ${amt.toLocaleString()} added!`)
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
          className="card w-full max-w-sm p-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Add Deposit</h2>
            <button onClick={onClose} className="p-1 rounded hover:bg-white/5 text-white/40">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Amount *</label>
              <input className="input-premium" type="number" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Note (optional)</label>
              <input className="input-premium" placeholder="E.g. Monthly savings" value={note} onChange={e => setNote(e.target.value)} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" className="btn-premium flex-1">Add Deposit</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
