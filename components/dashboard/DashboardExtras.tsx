"use client"

import type { Stats } from "@/types"
import CountUp from "@/components/ui/CountUp"
import { motion } from "framer-motion"

interface DashboardExtrasProps {
  stats: Stats
  symbol: string
}

export default function DashboardExtras({ stats, symbol }: DashboardExtrasProps) {
  const items = [
    { label: "Total Goals", value: stats.totalGoals, suffix: "" },
    { label: "Purchased", value: stats.purchasedGoals, suffix: "" },
    { label: "Pending", value: stats.pendingGoals, suffix: "" },
    { label: "Avg Goal Price", value: stats.averageGoalPrice, symbol },
    { label: "Most Expensive", value: stats.mostExpensiveGoal?.targetPrice ?? 0, symbol },
    { label: "Cheapest Goal", value: stats.cheapestGoal?.targetPrice ?? 0, symbol },
    { label: "Savings Rate", value: stats.averageSavingsRate, suffix: "%" },
    { label: "Life Score", value: stats.lifeScore, suffix: "" },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={i}
          whileHover={{ y: -1 }}
          className="card p-3.5 relative overflow-hidden"
        >
          <div className="text-xs text-white/40 mb-1.5 truncate">{item.label}</div>
          <div className="text-lg font-bold text-white">
            {"symbol" in item ? (
              <CountUp value={item.value} symbol={item.symbol} />
            ) : (
              <>{item.value}{item.suffix}</>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
