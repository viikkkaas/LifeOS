"use client"

import { useMemo } from "react"
import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { getCurrencySymbol } from "@/lib/utils"
import { Trophy, Zap, Lock } from "lucide-react"

const ACHIEVEMENT_DEFS = [
  { id: "first-lakh", name: "First ₹1 Lakh", desc: "Save ₹100,000 total", icon: "💰", xp: 100, check: (s: number) => s >= 100000 },
  { id: "first-ten-lakh", name: "First ₹10 Lakh", desc: "Save ₹1,000,000 total", icon: "💎", xp: 500, check: (s: number) => s >= 1000000 },
  { id: "first-crore", name: "First ₹1 Crore", desc: "Save ₹10,000,000 total", icon: "👑", xp: 2000, check: (s: number) => s >= 10000000 },
  { id: "first-apple", name: "Bought First Apple Product", desc: "Purchase any Apple product", icon: "📱", xp: 200, check: (s: number, names: string[]) => names.some(n => n.includes("iPhone") || n.includes("Apple") || n.includes("MacBook")) },
  { id: "first-vehicle", name: "Bought a Vehicle", desc: "Purchase a vehicle goal", icon: "🏍", xp: 300, check: (s: number, names: string[]) => names.some(n => n.includes("Harley") || n.includes("Car") || n.includes("Vehicle")) },
  { id: "dream-house", name: "Bought a House", desc: "Purchase real estate", icon: "🏠", xp: 5000, check: (s: number, names: string[]) => names.some(n => n.includes("House")) },
  { id: "completion-50", name: "50% Complete", desc: "Complete 50% of your goals", icon: "⭐", xp: 1000, check: (s: number, names: string[], purchased: number, total: number) => total > 0 && (purchased / total) >= 0.5 },
  { id: "completion-100", name: "100% Complete", desc: "Complete all your goals", icon: "🌟", xp: 10000, check: (s: number, names: string[], purchased: number, total: number) => total > 0 && purchased === total },
]

const TITLE_MILESTONES = [
  { level: 1, title: "Dreamer" },
  { level: 5, title: "Builder" },
  { level: 10, title: "Entrepreneur" },
  { level: 20, title: "Founder" },
  { level: 50, title: "Visionary" },
  { level: 100, title: "Legend" },
]

export default function AchievementsPage() {
  const { state } = useApp()
  const { goals, settings } = state.data
  const symbol = getCurrencySymbol(settings.currency, settings.customCurrencySymbol)

  const totalSaved = goals.reduce((s, g) => s + g.amountSaved, 0)
  const purchasedGoalNames = goals.filter(g => g.purchased).map(g => g.name)
  const purchasedCount = goals.filter(g => g.purchased).length
  const totalCount = goals.length

  const achievements = useMemo(() =>
    ACHIEVEMENT_DEFS.map(a => ({
      ...a,
      unlocked: a.check(totalSaved, purchasedGoalNames, purchasedCount, totalCount),
    })),
    [totalSaved, purchasedGoalNames, purchasedCount, totalCount]
  )

  const totalXP = achievements.filter(a => a.unlocked).reduce((s, a) => s + a.xp, 0)
  const totalPossibleXP = achievements.reduce((s, a) => s + a.xp, 0)
  const level = Math.floor(totalXP / 500) + 1
  const levelXP = totalXP % 500
  const maxLevelXP = 500

  const currentTitle = (() => {
    let title = "Dreamer"
    for (const m of TITLE_MILESTONES) {
      if (level >= m.level) title = m.title
    }
    return title
  })()

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white mb-2">Achievements</h1>
            <p className="text-white/40 text-sm mb-6">Unlock achievements as you progress through your journey</p>

            {/* XP / Level Card */}
            <div className="card p-6 mb-6 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-amber-500/5 to-purple-500/5 rounded-full blur-3xl" />
              <div className="relative flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{level}</span>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-white">{currentTitle}</div>
                  <div className="text-xs text-white/40 mt-1">Level {level} &middot; {totalXP} total XP</div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                      <span>Next Level</span>
                      <span>{levelXP} / {maxLevelXP} XP</span>
                    </div>
                    <div className="progress-bar h-1.5">
                      <div className="progress-bar-fill gold" style={{ width: `${(levelXP / maxLevelXP) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-white/30">Total XP</div>
                  <div className="text-lg font-bold text-white">{totalXP} <span className="text-sm font-normal text-white/30">/ {totalPossibleXP}</span></div>
                </div>
              </div>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((ach, i) => (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`card p-4 transition-all ${ach.unlocked ? 'border-amber-500/20' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-2xl relative ${ach.unlocked ? '' : 'grayscale opacity-40'}`}>
                      {ach.icon}
                      {!ach.unlocked && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                          <Lock size={8} className="text-white/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold text-sm ${ach.unlocked ? 'text-white' : 'text-white/50'}`}>{ach.name}</h3>
                        {ach.unlocked && <Trophy size={14} className="text-amber-400 flex-shrink-0" />}
                        {!ach.unlocked && <Lock size={12} className="text-white/20 flex-shrink-0" />}
                      </div>
                      <p className={`text-xs mt-0.5 ${ach.unlocked ? 'text-white/40' : 'text-white/20'}`}>{ach.desc}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Zap size={12} className="text-purple-400" />
                        <span className="text-xs text-purple-300">{ach.xp} XP</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Title Progression */}
            <div className="card p-5 mt-6">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Title Progression</h2>
              <div className="flex flex-wrap gap-2">
                {TITLE_MILESTONES.map(t => {
                  const earned = level >= t.level
                  const active = t.title === currentTitle
                  return (
                    <div
                      key={t.level}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        active
                          ? "bg-purple-500/25 text-purple-300 border border-purple-500/40 ring-1 ring-purple-500/30"
                          : earned
                            ? "bg-white/5 text-white/50 border border-white/10"
                            : "bg-white/[0.02] text-white/20 border border-white/5"
                      }`}
                    >
                      Lvl {t.level} - {t.title}
                      {active && " ★"}
                    </div>
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
