"use client"

import { useState, useEffect } from "react"
import type { Goal } from "@/types"
import { formatCompactCurrency, calculateProgress } from "@/lib/utils"

interface MotivationSectionProps {
  goals: Goal[]
  monthlyIncome: number
  savingsRate: number
  symbol: string
}

export default function MotivationSection({
  goals, monthlyIncome, savingsRate, symbol
}: MotivationSectionProps) {
  const [quote, setQuote] = useState("")

  useEffect(() => {
    const nonPurchased = goals.filter(g => !g.purchased)
    let msg = ""

    if (nonPurchased.length > 0) {
      const cheapest = nonPurchased.reduce((a, b) => a.targetPrice < b.targetPrice ? a : b)
      const remaining = cheapest.targetPrice - cheapest.amountSaved
      const monthlySavings = monthlyIncome * (savingsRate / 100)
      if (monthlySavings > 0) {
        const days = Math.ceil((remaining / monthlySavings) * 30)
        msg = `If you save ${symbol}${monthlySavings.toLocaleString()} this month, you'll complete "${cheapest.name}" ${days} days sooner.`
      }
    }

    if (!msg) {
      msg = "Every ₹ saved is a step closer to freedom. Keep going!"
    }

    setQuote(msg)
  }, [goals, monthlyIncome, savingsRate, symbol])

  return (
    <div className="card p-5 h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-bl-full" />
      <div className="relative z-10">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          Daily Motivation
        </h3>
        <p className="text-sm text-white/70 leading-relaxed italic">
          {quote}
        </p>
      </div>
    </div>
  )
}
