"use client"

import { motion } from "framer-motion"
import CountUp from "@/components/ui/CountUp"
import { formatCurrency } from "@/lib/utils"

interface ProgressSectionProps {
  percentage: number
  saved: number
  target: number
  symbol: string
}

export default function ProgressSection({ percentage, saved, target, symbol }: ProgressSectionProps) {
  return (
    <div className="card p-6 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-[0.02] blur-3xl bg-gradient-to-r from-purple-500 to-pink-500" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Overall Dream Completion
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40">
              <span className="text-white/70"><CountUp value={saved} symbol={symbol} /></span>
              {" / "}
              <CountUp value={target} symbol={symbol} />
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="progress-bar h-3 rounded-full">
            <motion.div
              className="progress-bar-fill h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          <motion.div
            className="absolute -top-10 font-bold text-3xl gradient-text"
            initial={{ left: 0 }}
            animate={{ left: `${Math.min(percentage, 85)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {percentage}%
          </motion.div>
        </div>

        <div className="mt-8 flex items-center gap-6 text-xs text-white/40">
          <span>Saved: <span className="text-white/70"><CountUp value={saved} symbol={symbol} /></span></span>
          <span>Target: <span className="text-white/70"><CountUp value={target} symbol={symbol} /></span></span>
          <span>Remaining: <span className="text-white/70"><CountUp value={target - saved} symbol={symbol} /></span></span>
        </div>
      </div>
    </div>
  )
}
