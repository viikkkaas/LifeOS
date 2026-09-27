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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
          Recent Goals
        </h2>
        <Link href="/goals" className="text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-widest">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recent.map((goal, i) => {
          const progress = calculateProgress(goal.amountSaved, goal.targetPrice)
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-shell p-1 group cursor-pointer"
            >
              <div className="card-core p-6 hover:bg-white/[0.03] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{goal.category}</span>
                  {goal.purchased && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                      Purchased
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-white text-base mb-3 group-hover:text-indigo-400 transition-colors">
                  {goal.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-white/40 mb-2 font-mono">
                  <span>{formatCompactCurrency(goal.amountSaved, symbol)} / {formatCompactCurrency(goal.targetPrice, symbol)}</span>
                  <span className="font-medium text-white/80">{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
