"use client"

import type { Goal } from "@/types"
import { calculateProgress, formatCompactCurrency } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"

interface RecentGoalsProps {
  goals: Goal[]
  symbol: string
}

export default function RecentGoals({ goals, symbol }: RecentGoalsProps) {
  const recent = [...goals].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 6)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Recent Goals
        </h2>
        <Link href="/goals" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recent.map((goal, i) => {
          const progress = calculateProgress(goal.amountSaved, goal.targetPrice)
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-4 hover:border-white/10 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-xs text-white/30">{goal.category}</div>
                {goal.purchased && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                    Purchased
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-white text-sm mb-2 group-hover:text-purple-300 transition-colors">
                {goal.name}
              </h3>
              <div className="flex items-center justify-between text-xs text-white/40 mb-2">
                <span>{formatCompactCurrency(goal.amountSaved, symbol)} / {formatCompactCurrency(goal.targetPrice, symbol)}</span>
                <span className="font-medium text-white/60">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
