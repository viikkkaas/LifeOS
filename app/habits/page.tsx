"use client"

import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { getToday } from "@/lib/utils"
import { Flame } from "lucide-react"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function HabitsPage() {
  const { state, dispatch } = useApp()
  const { habits } = state.data

  const today = getToday()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() + i)
    return d.toISOString().split("T")[0]
  })

  const toggleHabit = (habitId: string, completed: boolean) => {
    dispatch({
      type: "ADD_HABIT_LOG",
      payload: { habitId, date: today, completed }
    })
  }

  const getHabitStatus = (habitId: string, date: string): boolean => {
    const habit = habits.find(h => h.id === habitId)
    return habit?.logs.find(l => l.date === date)?.completed || false
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white mb-2">Habit Tracker</h1>
            <p className="text-white/40 text-sm mb-8">Track daily habits and maintain streaks</p>

            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Header */}
                <div className="grid grid-cols-[2fr_repeat(7,1fr)_80px] gap-2 mb-3 px-3">
                  <div className="text-xs text-white/40 font-medium">Habit</div>
                  {weekDays.map((day, i) => {
                    const d = new Date(day)
                    return (
                      <div key={day} className={`text-center text-xs font-medium ${day === today ? 'text-purple-400' : 'text-white/40'}`}>
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
                      className="grid grid-cols-[2fr_repeat(7,1fr)_80px] gap-2 items-center p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{habit.icon}</span>
                        <span className="text-sm text-white/80 font-medium">{habit.name}</span>
                      </div>

                      {weekDays.map(day => {
                        const completed = getHabitStatus(habit.id, day)
                        const isToday = day === today
                        return (
                          <button
                            key={day}
                            onClick={() => toggleHabit(habit.id, !completed)}
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
    </div>
  )
}
