"use client"

import { useApp } from "@/store/AppContext"
import { motion } from "framer-motion"
import { getCurrencySymbol, getToday, getCurrentAge, getDaysAlive } from "@/lib/utils"
import KPICard from "./KPICard"
import ProgressSection from "./ProgressSection"
import DashboardExtras from "./DashboardExtras"
import MotivationSection from "./MotivationSection"
import RecentGoals from "./RecentGoals"

export default function DashboardView() {
  const { state } = useApp()
  const { stats, data } = state
  const symbol = getCurrencySymbol(data.settings.currency, data.settings.customCurrencySymbol)

  const kpiCards = [
    { label: "Total Dream Cost", value: stats.totalDreamCost, symbol, color: "from-blue-500 to-purple-500" },
    { label: "Current Net Worth", value: stats.currentNetWorth, symbol, color: "from-emerald-500 to-teal-500" },
    { label: "Total Saved", value: stats.totalSaved, symbol, color: "from-violet-500 to-pink-500" },
    { label: "Remaining Amount", value: stats.remainingAmount, symbol, color: "from-amber-500 to-orange-500" },
    { label: "Monthly Income", value: data.settings.monthlyIncome, symbol, color: "from-cyan-500 to-blue-500" },
    { label: "Monthly Savings", value: stats.monthlySavings, symbol, color: "from-rose-500 to-red-500" },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            LifeOS
          </h1>
          <p className="text-white/40 mt-1 text-sm">
            Your personal financial operating system
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/40">{getToday()}</div>
          <div className="text-2xl font-bold gradient-text">{stats.lifeScore}</div>
          <div className="text-xs text-white/30">Life Score</div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiCards.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </motion.div>

      {/* Progress */}
      <motion.div variants={item}>
        <ProgressSection
          percentage={stats.overallCompletionPercentage}
          saved={stats.totalSaved}
          target={stats.totalDreamCost}
          symbol={symbol}
        />
      </motion.div>

      {/* Extras and Motivation */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DashboardExtras stats={stats} symbol={symbol} />
        </div>
        <div>
          <MotivationSection
            goals={data.goals}
            monthlyIncome={data.settings.monthlyIncome}
            savingsRate={data.settings.savingsRate}
            symbol={symbol}
          />
        </div>
      </motion.div>

      {/* Recent Goals */}
      <motion.div variants={item}>
        <RecentGoals goals={data.goals} symbol={symbol} />
      </motion.div>
    </motion.div>
  )
}
