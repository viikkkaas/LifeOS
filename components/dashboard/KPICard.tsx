"use client"

import { motion } from "framer-motion"
import CountUp from "@/components/ui/CountUp"
import { cn } from "@/lib/utils"

interface KPICardProps {
  label: string
  value: number
  symbol: string
  color: string
}

export default function KPICard({ label, value, symbol, color }: KPICardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className={cn(
        "card p-4 sm:p-5 relative overflow-hidden group cursor-pointer",
        "hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
      )}
    >
      {/* Gradient accent line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-60",
        color
      )} />

      {/* Background glow */}
      <div className={cn(
        "absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-[0.03] blur-3xl bg-gradient-to-r",
        color
      )} />

      <div className="relative z-10">
        <div className="kpi-label mb-1">{label}</div>
        <div className="kpi-value">
          <CountUp value={value} symbol={symbol} />
        </div>
      </div>
    </motion.div>
  )
}
