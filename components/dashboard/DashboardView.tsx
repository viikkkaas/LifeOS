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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            LifeOS
          </h1>
          <p className="text-white/40 mt-1 text-sm">
            Track your goals, money, and life in one place.
          </p>
        </div>
        <div className="text-right relative">
          <button
            onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
            className="text-right hover:opacity-80 transition-opacity"
          >
            <div className="text-2xl font-bold gradient-text">{stats.lifeScore}</div>
            <div className="text-xs text-white/30">Life Score</div>
          </button>
          {showScoreBreakdown && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-72 card p-4 z-20 shadow-xl"
            >
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Score Breakdown</div>
              <div className="space-y-3">
                {LIFESCORE_COMPONENTS.map(c => {
                  const raw = stats.lifeScoreComponents[c.key]
                  const weighted = Math.round(raw * c.weight)
                  return (
                    <div key={c.key}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white/50">{c.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white/40 text-[10px]">{c.desc}</span>
                          <span className="text-white/80 font-mono">{raw.toFixed(0)}</span>
                          <span className="text-white/30">× {Math.round(c.weight * 100)}%</span>
                          <span className="text-purple-300 font-mono">= {weighted}</span>
                        </div>
                      </div>
                      <div className="progress-bar h-1">
                        <div className="progress-bar-fill" style={{ width: `${Math.min(raw, 100)}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                <span className="text-white/30">Total</span>
                <span className="text-white font-mono font-bold">{stats.lifeScore}</span>
              </div>
            </motion.div>
          )}
          <div className="text-xs text-white/20 mt-1">{getToday()}</div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-[0.03] blur-3xl bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="relative z-10">
            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">
              {heroLabel}
            </div>
            <div className="flex items-end gap-4">
              <div className="text-5xl sm:text-6xl font-bold tracking-tight text-white">
                <CountUp value={heroValue} symbol={symbol} />
              </div>
              {trendPct !== null && (
                <div className="flex items-center gap-1 text-sm text-emerald-400 mb-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="font-medium">{trendPct}% vs last month</span>
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
        <div className="card p-6">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Nudges & Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => router.push('/goals')}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <span className="text-amber-400 text-sm">⚠</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white">{needsAttention}</div>
                <div className="text-xs text-white/40">goal{needsAttention !== 1 ? 's' : ''} need{needsAttention === 1 ? 's' : ''} attention</div>
              </div>
            </button>
            <button
              onClick={() => router.push('/goals')}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <span className="text-blue-400 text-sm">{stats.pendingGoals}</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white">{stats.pendingGoals} pending</div>
                <div className="text-xs text-white/40">goals to complete</div>
              </div>
            </button>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <span className="text-emerald-400 text-sm">₹</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white">
                  {behindOnSavings ? "Behind" : "On track"}
                </div>
                <div className="text-xs text-white/40">
                  {formatCompactCurrency(stats.monthlySavings, symbol)} / {formatCompactCurrency(defaultMonthlySavings, symbol)} this month
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                <span className="text-purple-400 text-sm">🎯</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {topGoal?.name ?? "—"}
                </div>
                <div className="text-xs text-white/40">closest to completion</div>
              </div>
            </div>
          </div>
          {unrealisticGoals.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {unrealisticGoals.slice(0, 2).map(({ goal, months }) => (
                <button
                  key={goal.id}
                  onClick={() => router.push('/goals')}
                  className="flex items-center gap-2 w-full p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-colors text-left"
                >
                  <span className="text-amber-400 text-sm shrink-0">⏳</span>
                  <div className="text-xs text-white/60 min-w-0">
                    <span className="text-white/80 font-medium">{goal.name}</span>
                    <span className="text-white/40"> — ~{months} month{months > 1 ? 's' : ''} at current rate{goal.recurringSaving === 0 ? ' — try increasing monthly contribution' : ''}</span>
                  </div>
                </button>
              ))}
              {unrealisticGoals.length > 2 && (
                <div className="text-xs text-white/30 text-center">
                  +{unrealisticGoals.length - 2} more goal{unrealisticGoals.length - 2 > 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={item}>
        <RecentGoals goals={data.goals} symbol={symbol} />
      </motion.div>
    </motion.div>
  )
}
