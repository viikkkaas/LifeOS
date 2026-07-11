"use client"

import { useState } from "react"
import type { Goal } from "@/types"
import { calculateProgress, formatCompactCurrency, generateId, getToday } from "@/lib/utils"
import { Edit3, Trash2, Copy, CheckCircle, Lock, Unlock, Plus } from "lucide-react"
import EditGoalModal from "@/components/modals/EditGoalModal"
import AddDepositModal from "@/components/modals/AddDepositModal"
import toast from "react-hot-toast"

interface GoalCardProps {
  goal: Goal
  symbol: string
  dispatch: any
  locked: boolean
}

export default function GoalCard({ goal, symbol, dispatch, locked }: GoalCardProps) {
  const progress = calculateProgress(goal.amountSaved, goal.targetPrice)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeposit, setShowDeposit] = useState(false)

  const handleDelete = () => {
    if (locked) { toast.error("Unlock settings to delete goals"); return }
    dispatch({ type: "DELETE_GOAL", payload: goal.id })
    toast.success("Goal deleted")
  }

  const handleDuplicate = () => {
    dispatch({ type: "DUPLICATE_GOAL", payload: goal })
    toast.success("Goal duplicated")
  }

  const handleMarkPurchased = () => {
    if (locked) { toast.error("Unlock settings to modify goals"); return }
    dispatch({
      type: "MARK_PURCHASED",
      payload: { id: goal.id, date: getToday() }
    })
    toast.success("🎉 Goal completed!")
  }

  const handleToggleLock = () => {
    dispatch({ type: "TOGGLE_LOCK_GOAL", payload: goal.id })
    toast.success(goal.locked ? "Goal unlocked" : "Goal locked")
  }

  // Countdown
  const remaining = goal.targetPrice - goal.amountSaved
  const monthlySavings = goal.recurringSaving || 0
  const monthsNeeded = monthlySavings > 0 ? Math.ceil(remaining / monthlySavings) : null
  const goalDate = monthsNeeded ? new Date() : null
  if (goalDate && monthsNeeded) goalDate.setMonth(goalDate.getMonth() + monthsNeeded)

  return (
    <>
      <div className={`card p-5 relative overflow-hidden group transition-all duration-300 ${goal.purchased ? 'opacity-70' : ''}`}>
        {/* Top gradient line */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${
          goal.purchased ? 'bg-emerald-500/50' :
          progress >= 100 ? 'bg-green-500/50' :
          progress >= 50 ? 'bg-purple-500/50' :
          'bg-white/5'
        }`} />

        {/* Lock indicator */}
        {goal.locked && (
          <div className="absolute top-3 right-3 text-white/20">
            <Lock size={14} />
          </div>
        )}

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 uppercase tracking-wider">
                  {goal.category}
                </span>
                {goal.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="font-semibold text-white text-base truncate">{goal.name}</h3>
            </div>
          </div>

          {/* Why */}
          {goal.why && (
            <p className="text-xs text-white/30 italic mb-3 line-clamp-2">&ldquo;{goal.why}&rdquo;</p>
          )}

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-white/60">{symbol}{formatCompactCurrency(goal.amountSaved)}</span>
              <span className="text-white/40">of {symbol}{formatCompactCurrency(goal.targetPrice)}</span>
              <span className="font-semibold text-white/80">{progress}%</span>
            </div>
            <div className="progress-bar h-2">
              <div
                className={`progress-bar-fill ${goal.purchased ? 'green' : progress >= 100 ? 'green' : ''}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Info Row */}
          <div className="flex items-center justify-between text-xs text-white/40 mb-1">
            <span>Priority: <span className={`font-medium ${
              goal.priority === "Critical" ? "text-red-400" :
              goal.priority === "High" ? "text-amber-400" :
              goal.priority === "Medium" ? "text-blue-400" :
              "text-white/50"
            }`}>{goal.priority}</span></span>
            <span>Target: {goal.targetYear}</span>
          </div>

          {/* Remaining + Countdown */}
          <div className="text-xs text-white/40 mb-3">
            <span>Remaining: {symbol}{formatCompactCurrency(remaining)}</span>
            {monthsNeeded && monthsNeeded > 0 && (
              <span className="ml-3 text-purple-300">
                ~{monthsNeeded} month{monthsNeeded > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Purchase status */}
          {goal.purchased && goal.purchaseDate && (
            <div className="mb-3 text-xs text-emerald-400 font-medium">
              ✓ Purchased on {new Date(goal.purchaseDate).toLocaleDateString()}
            </div>
          )}

          {/* Deposits count */}
          {goal.deposits.length > 0 && (
            <div className="text-[10px] text-white/30 mb-3">
              {goal.deposits.length} deposit{goal.deposits.length > 1 ? 's' : ''} logged
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.04]">
            <button
              onClick={() => { if (locked) { toast.error("Unlock settings to edit"); return }; setShowEdit(true) }}
              className="p-1.5 rounded hover:bg-white/5 text-white/30 hover:text-white/70 transition-colors"
              title="Edit"
            >
              <Edit3 size="14" />
            </button>
            <button
              onClick={handleDuplicate}
              className="p-1.5 rounded hover:bg-white/5 text-white/30 hover:text-white/70 transition-colors"
              title="Duplicate"
            >
              <Copy size="14" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size="14" />
            </button>
            {!goal.purchased && (
              <button
                onClick={handleMarkPurchased}
                className="p-1.5 rounded hover:bg-emerald-500/10 text-white/30 hover:text-emerald-400 transition-colors"
                title="Mark as Purchased"
              >
                <CheckCircle size="14" />
              </button>
            )}
            <button
              onClick={() => setShowDeposit(true)}
              className="ml-auto p-1.5 rounded hover:bg-white/5 text-white/30 hover:text-white/70 transition-colors"
              title="Add Deposit"
            >
              <Plus size="14" />
            </button>
            <button
              onClick={handleToggleLock}
              className={`p-1.5 rounded hover:bg-white/5 transition-colors ${goal.locked ? 'text-amber-400' : 'text-white/30 hover:text-white/70'}`}
              title={goal.locked ? "Unlock" : "Lock"}
            >
              {goal.locked ? <Lock size="14" /> : <Unlock size="14" />}
            </button>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditGoalModal
          goal={goal}
          onClose={() => setShowEdit(false)}
          dispatch={dispatch}
        />
      )}
      {showDeposit && (
        <AddDepositModal
          goalId={goal.id}
          onClose={() => setShowDeposit(false)}
          dispatch={dispatch}
        />
      )}
    </>
  )
}
