"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { getCurrencySymbol, formatCompactCurrency } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function CalendarPage() {
  const { state } = useApp()
  const { goals, settings } = state.data
  const symbol = getCurrencySymbol(settings.currency, settings.customCurrencySymbol)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const goalEvents = useMemo(() => {
    const events: { date: string; goal: typeof goals[0] }[] = []
    goals.forEach(g => {
      if (g.purchaseDate) {
        events.push({ date: g.purchaseDate, goal: g })
      }
    })
    return events
  }, [goals])

  const calendarDays = useMemo(() => {
    const days: { day: number; events: typeof goalEvents }[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      const events = goalEvents.filter(e => e.date === dateStr)
      days.push({ day: d, events })
    }
    return days
  }, [daysInMonth, currentMonth, currentYear, goalEvents])

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white mb-2">Calendar</h1>
            <p className="text-white/40 text-sm mb-8">Track goal purchase dates and upcoming targets</p>

            {/* Month header */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-semibold text-white">
                  {MONTHS[currentMonth]} {currentYear}
                </h2>
                <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs text-white/40 font-medium py-2">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {calendarDays.map(({ day, events }) => (
                  <div
                    key={day}
                    className={`aspect-square rounded-lg p-1.5 transition-colors ${
                      isToday(day)
                        ? "bg-purple-500/10 border border-purple-500/30"
                        : events.length > 0
                          ? "bg-emerald-500/5 border border-emerald-500/10"
                          : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className={`text-xs font-medium ${isToday(day) ? 'text-purple-400' : 'text-white/60'}`}>
                      {day}
                    </div>
                    {events.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {events.slice(0, 2).map((e, i) => (
                          <div key={i} className="text-[8px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300 truncate leading-tight">
                            ✓ {e.goal.name}
                          </div>
                        ))}
                        {events.length > 2 && (
                          <div className="text-[8px] text-white/30">+{events.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming targets this month */}
            <div className="card p-5 mt-4">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Upcoming Targets</h2>
              {goals.filter(g => !g.purchased && g.targetYear === currentYear).length === 0 ? (
                <p className="text-sm text-white/30">No goals targeting this year</p>
              ) : (
                <div className="space-y-2">
                  {goals.filter(g => !g.purchased && g.targetYear === currentYear).map(g => (
                    <div key={g.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span className="text-sm text-white/80">{g.name}</span>
                      </div>
                      <span className="text-xs text-white/40">{symbol}{formatCompactCurrency(g.targetPrice)}</span>
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
