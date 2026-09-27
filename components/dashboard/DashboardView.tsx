"use client"

import { useEffect, useMemo, useState } from "react"
import { useApp } from "@/store/AppContext"
import { motion } from "framer-motion"
import { getCurrencySymbol, getToday, formatCompactCurrency } from "@/lib/utils"
import ProgressSection from "./ProgressSection"
import RecentGoals from "./RecentGoals"
import CountUp from "@/components/ui/CountUp"
import Link from "next/link"
import { useRouter } from "next/navigation"

const LIFESCORE_COMPONENTS = [
  { key: "netWorthGrowth" as const, label: "Net Worth Growth", weight: 0.25, desc: "Positive net worth baseline" },
  { key: "goalCompletionRate" as const, label: "Goal Completion", weight: 0.25, desc: "Purchased / total goals" },
  { key: "savingsConsistency" as const, label: "Savings Consistency", weight: 0.20, desc: "vs 50% of income target" },
  { key: "habitStreaks" as const, label: "Habit Streaks", weight: 0.15, desc: "Habits with 3+ day streak" },
  { key: "businessGrowth" as const, label: "Business Growth", weight: 0.15, desc: "Revenue > 0 baseline" },
]

export default function DashboardView() {
  const { state, dispatch } = useApp()
  const { stats, data, initialized } = state
  const router = useRouter()
  const symbol = getCurrencySymbol(data.settings.currency, data.settings.customCurrencySymbol)
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false)

  useEffect(() => {
    if (data.goals.length > 0 && stats.totalSaved === 0 && initialized) {
      dispatch({ type: "RECALCULATE" })
    }
  }, [data.goals.length, stats.totalSaved, initialized, dispatch])

  const needsAttention = useMemo(() => {
    return data.goals.filter(g =>
      !g.purchased && g.targetPrice > 0 && (g.amountSaved / g.targetPrice) < 0.1
    ).length
  }, [data.goals])

  const behindOnSavings = useMemo(() => {
    const potential = data.settings.monthlyIncome * (data.settings.savingsRate / 100)
    return potential > 0 && stats.monthlySavings < potential * 0.8
  }, [data.settings, stats.monthlySavings])

  const todayEntry = useMemo(() => {
    return (data.dailyGoals ?? []).find(dg => dg.date === getToday())
  }, [data.dailyGoals])

  const weekSales = useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    const entries = (data.dailyGoals ?? []).filter(dg => {
      const d = new Date(dg.date)
      return d >= start && d <= now
    })
    const sum = (f: (e: any) => number) => entries.reduce((s, e) => s + f(e), 0)
    return {
      calls: sum(e => e.coldCalls),
      demos: sum(e => e.demos),
      shows: sum(e => e.shows),
      closes: sum(e => e.closes || 0),
    }
  }, [data.dailyGoals])

  const nextTarget = useMemo(() => {
    const targets = [
      { label: "Aug '26", through: "2026-08", count: 1 },
      { label: "Oct '26", through: "2026-10", count: 3 },
      { label: "Dec '26", through: "2026-12", count: 5 },
    ]
    const signed = (through: string) =>
      (data.clients ?? []).filter(c => c.closeDate && c.closeDate.slice(0, 7) <= through).length
    const next = targets.find(t => signed(t.through) < t.count) ?? targets[targets.length - 1]
    return { label: next.label, count: next.count, signed: signed(next.through) }
  }, [data.clients])

  const totalClientMrr = useMemo(() => {
    return (data.clients ?? []).reduce((s, c) => s + (c.mrr || 0), 0)
  }, [data.clients])

  const topGoal = useMemo(() => {
    const active = data.goals.filter(g => !g.purchased)
    if (active.length === 0) return null
    return active.reduce((a, b) => (a.amountSaved / a.targetPrice) > (b.amountSaved / b.targetPrice) ? a : b)
  }, [data.goals])

  const defaultMonthlySavings = data.settings.monthlyIncome * (data.settings.savingsRate / 100)

  const unrealisticGoals = useMemo(() => {
    return data.goals
      .filter(g => !g.purchased)
      .map(g => {
        const monthly = g.recurringSaving > 0 ? g.recurringSaving : defaultMonthlySavings
        const remaining = g.targetPrice - g.amountSaved
        const months = monthly > 0 ? Math.ceil(remaining / monthly) : Infinity
        return { goal: g, months }
      })
      .filter(g => g.months > 120)
      .sort((a, b) => b.months - a.months)
  }, [data.goals, defaultMonthlySavings])

  const heroValue = useMemo(() => {
    return stats.currentNetWorth || stats.totalSaved || stats.totalDreamCost
  }, [stats])

  const heroLabel = useMemo(() => {
    if (stats.currentNetWorth > 0) return "Net Worth"
    if (stats.totalSaved > 0) return "Total Saved"
    return "Total Dream Cost"
  }, [stats])

  const trendPct = useMemo(() => {
    if (stats.currentNetWorth <= 0) return null
    const monthly = data.settings.monthlyIncome * (data.settings.savingsRate / 100)
    if (monthly <= 0) return null
    return Math.round((monthly / stats.currentNetWorth) * 100)
  }, [stats.currentNetWorth, data.settings])

  if (!initialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white/40 text-sm">Loading...</div>
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            LifeOS
          </h1>
          <p className="text-white/40 mt-1 text-sm font-mono">
            {getToday()}
          </p>
        </div>
        <div className="text-right relative">
          <button
            onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
            className="text-right hover:opacity-80 transition-opacity"
          >
            <div className="text-3xl font-bold gradient-text font-mono">{stats.lifeScore}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-widest">Life Score</div>
          </button>
          {showScoreBreakdown && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-4 w-80 card-shell p-1 z-20 shadow-2xl"
            >
              <div className="card-core p-5">
                <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-4">Score Breakdown</div>
                <div className="space-y-4">
                  {LIFESCORE_COMPONENTS.map(c => {
                    const raw = stats.lifeScoreComponents[c.key]
                    const weighted = Math.round(raw * c.weight)
                    return (
                      <div key={c.key}>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-white/60">{c.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white/30 font-mono text-[10px]">{raw.toFixed(0)}</span>
                            <span className="text-purple-300 font-mono font-bold">= {weighted}</span>
                          </div>
                        </div>
                        <div className="progress-bar h-1.5 rounded-full">
                          <div className="progress-bar-fill rounded-full" style={{ width: `${Math.min(raw, 100)}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between text-sm">
                  <span className="text-white/40">Total Score</span>
                  <span className="text-white font-mono font-bold">{stats.lifeScore}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Hero KPI Card - Doppelrand Architecture */}
      <motion.div variants={item} className="card-shell">
        <div className="card-core p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-[0.05] blur-3xl bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="relative z-10">
            <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
              {heroLabel}
            </div>
            <div className="flex items-end gap-6">
              <div className="text-6xl font-bold tracking-tight text-white font-mono">
                <CountUp value={heroValue} symbol={symbol} />
              </div>
              {trendPct !== null && (
                <div className="flex items-center gap-1.5 text-sm text-emerald-400 mb-3">
                  <span className="font-medium font-mono">+{trendPct}%</span>
                  <span className="text-white/30 text-xs uppercase tracking-wider">vs last mo</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <ProgressSection
          percentage={stats.overallCompletionPercentage}
          saved={stats.totalSaved}
          target={stats.totalDreamCost}
          symbol={symbol}
        />
      </motion.div>

      <motion.div variants={item}>
        <div className="card-shell p-1">
          <div className="card-core p-8">
            <h2 className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-6">Nudges & Insights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Goals needing attention", value: needsAttention, icon: "⚠", color: "text-amber-400", bg: "bg-amber-500/10" },
                { label: "Pending goals", value: stats.pendingGoals, icon: "🎯", color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "Savings health", value: behindOnSavings ? "Behind" : "On track", icon: "₹", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { label: "Closest to completion", value: topGoal?.name ?? "—", icon: "✨", color: "text-purple-400", bg: "bg-purple-500/10" },
              ].map((nudge, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full ${nudge.bg} flex items-center justify-center shrink-0`}>
                    <span className={`${nudge.color}`}>{nudge.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-bold text-white truncate">{nudge.value}</div>
                    <div className="text-[11px] text-white/40 leading-tight">{nudge.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sales Snapshot */}
      <motion.div variants={item}>
        <div className="card-shell p-1">
          <div className="card-core p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Sales Snapshot</h2>
              <Link href="/sales/daily" className="text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-widest">Daily Log →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { label: "Calls", val: weekSales.calls, icon: "📞" },
                { label: "Demos Booked", val: weekSales.demos, icon: "🖥️" },
                { label: "Demos Held", val: weekSales.shows, icon: "🎥" },
                { label: "Closes", val: weekSales.closes, icon: "🏆" },
                { label: "Target", val: `${nextTarget.signed}/${nextTarget.count}`, icon: "🎯" },
                { label: "MRR", val: formatCompactCurrency(totalClientMrr, symbol), icon: "💵" },
              ].map((stat, i) => (
                <div key={i} className="text-center group cursor-default">
                  <div className="text-lg mb-2 opacity-50 group-hover:opacity-100 transition-opacity">{stat.icon}</div>
                  <div className="text-xl font-bold text-white font-mono">{stat.val}</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <RecentGoals goals={data.goals} symbol={symbol} />
      </motion.div>
    </motion.div>
  )
}
