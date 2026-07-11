"use client"

import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { getCurrencySymbol, formatCompactCurrency } from "@/lib/utils"
import { CheckCircle, Clock } from "lucide-react"

export default function TimelinePage() {
  const { state } = useApp()
  const { goals, settings } = state.data
  const symbol = getCurrencySymbol(settings.currency, settings.customCurrencySymbol)

  // Sort goals by target year then by progress (closer to completion first)
  const sorted = [...goals].sort((a, b) => {
    if (a.purchased && !b.purchased) return -1
    if (!a.purchased && b.purchased) return 1
    if (a.purchased && b.purchased) {
      return new Date(b.purchaseDate || "").getTime() - new Date(a.purchaseDate || "").getTime()
    }
    if (a.targetYear !== b.targetYear) return a.targetYear - b.targetYear
    return (b.amountSaved / b.targetPrice) - (a.amountSaved / a.targetPrice)
  })

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white mb-2">Timeline</h1>
            <p className="text-white/40 text-sm mb-8">Your journey to achieving every dream</p>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/30 via-purple-500/10 to-transparent" />

              <div className="space-y-6">
                {sorted.map((goal, i) => {
                  const progress = Math.round((goal.amountSaved / goal.targetPrice) * 100)
                  const remaining = goal.targetPrice - goal.amountSaved
                  const monthlySavings = goal.recurringSaving || 0
                  const monthsNeeded = monthlySavings > 0 && remaining > 0 ? Math.ceil(remaining / monthlySavings) : null
                  const estimatedDate = monthsNeeded ? new Date() : null
                  if (estimatedDate && monthsNeeded) estimatedDate.setMonth(estimatedDate.getMonth() + monthsNeeded)

                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative pl-14"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-4 top-2 w-4 h-4 rounded-full border-2 ${
                        goal.purchased
                          ? "bg-emerald-500 border-emerald-500"
                          : "bg-[#0a0a0f] border-purple-500/50"
                      }`}>
                        {goal.purchased && (
                          <CheckCircle size={14} className="text-white absolute -top-0.5 -left-0.5" />
                        )}
                      </div>

                      <div className={`card p-4 ${goal.purchased ? 'border-emerald-500/10' : ''}`}>
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-semibold text-sm text-white">{goal.name}</h3>
                            <span className="text-xs text-white/30">{goal.category}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-white/40">{goal.targetYear}</div>
                            {goal.purchased && goal.purchaseDate && (
                              <div className="text-[10px] text-emerald-400">
                                {new Date(goal.purchaseDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-white/40 mt-2">
                          <span>{symbol}{formatCompactCurrency(goal.amountSaved)} / {symbol}{formatCompactCurrency(goal.targetPrice)}</span>
                          <span className="font-medium text-white/60">{progress}%</span>
                        </div>

                        <div className="progress-bar mt-2">
                          <div className={`progress-bar-fill ${goal.purchased ? 'green' : ''}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                        </div>

                        {!goal.purchased && estimatedDate && (
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-purple-300">
                            <Clock size={10} />
                            <span>Est. {estimatedDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
