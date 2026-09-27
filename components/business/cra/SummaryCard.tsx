"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SummaryCardProps {
  label: string
  value: string
  tone?: string
  trend?: string
  isPositive?: boolean
  subtext?: string
}

export function SummaryCard({
  label,
  value,
  tone = "text-white",
  trend,
  isPositive,
  subtext,
}: SummaryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "card-shell p-1 relative overflow-hidden group cursor-pointer transition-all duration-300"
      )}
    >
      <div className="card-core p-4 sm:p-5 relative">
        <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1 font-mono">
          {label}
        </div>
        <div className={cn("text-2xl font-bold font-mono tracking-tight", tone)}>
          {value}
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={cn(
                "text-xs font-mono font-medium",
                isPositive ? "text-emerald-400" : "text-red-400"
              )}
            >
              {trend}
            </span>
            {subtext && (
              <span className="text-white/30 text-[10px] uppercase tracking-wider">
                {subtext}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
