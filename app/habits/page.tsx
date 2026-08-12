"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { getToday } from "@/lib/utils"
import { Flame, ChevronLeft, ChevronRight, Plus, Edit3, Trash2 } from "lucide-react"
import AddHabitModal from "@/components/modals/AddHabitModal"
import toast from "react-hot-toast"
import type { Habit } from "@/types"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function HabitsPage() {
  const { state, dispatch } = useApp()
  const { habits } = state.data
  const [weekOffset, setWeekOffset] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  const today = getToday()

  const weekStart = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() + weekOffset * 7)
    return d
  }, [weekOffset])

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d.toISOString().split("T")[0]
    }),
    [weekStart]
  )

  const canGoForward = weekOffset < 0

  const toggleHabit = (habitId: string, completed: boolean, date: string) => {
    dispatch({
      type: "ADD_HABIT_LOG",
      payload: { habitId, date, completed }
    })
  }

  const getHabitStatus = (habitId: string, date: string): boolean => {
    const habit = habits.find(h => h.id === habitId)
    return habit?.logs.find(l => l.date === date)?.completed || false
  }

  const handleDelete = (habit: Habit) => {
    if (state.data.settings.locked) { toast.error("Unlock settings to delete habits"); return }
    dispatch({ type: "DELETE_HABIT", payload: habit.id })
    toast.success("Habit deleted")
  }

  const handleOpenAdd = () => {
    if (state.data.settings.locked) { toast.error("Unlock settings to add habits"); return }
    setEditingHabit(null)
    setShowAddModal(true)
  }

  const handleOpenEdit = (habit: Habit) => {
    if (state.data.settings.locked) { toast.error("Unlock settings to edit habits"); return }
    setEditingHabit(habit)
    setShowAddModal(true)
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Habit Tracker</h1>
                <p className="text-white/40 text-sm mt-1">Track daily habits and maintain streaks</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekOffset(o => o - 1)}
                  className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-white/60 min-w-[100px] text-center">
                  {weekOffset === 0 ? "This Week" : weekOffset === -1 ? "Last Week" : `${Math.abs(weekOffset)} weeks ago`}
                </span>
                <button
                  onClick={() => setWeekOffset(o => Math.min(o + 1, 0))}
                  disabled={!canGoForward}
                  className={`p-2 rounded-lg transition-colors ${
                    canGoForward ? 'hover:bg-white/5 text-white/40 hover:text-white/70' : 'text-white/10 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Header */}
                <div className="grid grid-cols-[2fr_repeat(7,1fr)_80px] gap-2 mb-3 px-3">
                  <div className="text-xs text-white/40 font-medium">Habit</div>
                  {weekDays.map((day, i) => {
                    const d = new Date(day)
                    return (
                      <div key={day} className={`text-center text-xs font-medium ${day === today && weekOffset === 0 ? 'text-purple-400' : 'text-white/40'}`}>
                        <div>{DAYS[d.getDay()]}</div>
                        <div>{d.getDate()}</div>
                      </div>
                    )
                  })}
                  <div className="text-center text-xs text-white/40">Streak</div>
                </div>

                {/* Habits */}
                <div className="space-y-2">
                  {habits.map((habit, i) => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="grid grid-cols-[2fr_repeat(7,1fr)_80px] gap-2 items-center p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{habit.icon}</span>
                        <span className="text-sm text-white/80 font-medium">{habit.name}</span>
                        <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(habit)}
                            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(habit)}
                            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                        {weekDays.map(day => {
                          const completed = getHabitStatus(habit.id, day)
                          const isToday = day === today
                          return (
                            <button
                              key={day}
                              onClick={() => toggleHabit(habit.id, !completed, day)}
                            className={`w-8 h-8 mx-auto rounded-full transition-all ${
                              completed
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : isToday
                                  ? "bg-white/5 text-white/30 border border-white/10 hover:bg-white/10"
                                  : "bg-white/5 text-white/20 border border-transparent"
                            }`}
                          >
                            {completed ? "✓" : ""}
                          </button>
                        )
                      })}

                      <div className="flex items-center justify-center gap-1">
                        <Flame size={14} className={habit.streak > 0 ? 'text-orange-400' : 'text-white/20'} />
                        <span className={`text-sm font-medium ${habit.streak > 0 ? 'text-orange-400' : 'text-white/40'}`}>
                          {habit.streak}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <button
        onClick={handleOpenAdd}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all z-30 flex items-center justify-center"
      >
        <Plus size="24" />
      </button>

      {showAddModal && (
        <AddHabitModal
          onClose={() => setShowAddModal(false)}
          dispatch={dispatch}
          habit={editingHabit}
        />
      )}
    </div>
  )
}
