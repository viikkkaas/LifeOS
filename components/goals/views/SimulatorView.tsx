"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/store/AppContext"
import { motion } from "framer-motion"
import { getCurrencySymbol, formatCompactCurrency } from "@/lib/utils"
import CountUp from "@/components/ui/CountUp"

export default function SimulatorView() {
  const { state } = useApp()
  const { goals, settings } = state.data
  const symbol = getCurrencySymbol(settings.currency, settings.customCurrencySymbol)

  const [income, setIncome] = useState(settings.monthlyIncome)
  const [savingsRate, setSavingsRate] = useState(settings.savingsRate)
  const [profitMargin, setProfitMargin] = useState(settings.businessProfitMargin)

  const totalNeeded = goals.reduce((s, g) => s + (g.targetPrice - g.amountSaved), 0)
  const monthlySavings = income * (savingsRate / 100)
  const businessProfit = income * (profitMargin / 100)
  const totalMonthly = monthlySavings + businessProfit

  const months = totalMonthly > 0 ? Math.ceil(totalNeeded / totalMonthly) : 9999
  const estimatedDate = new Date()
  estimatedDate.setMonth(estimatedDate.getMonth() + months)

  const goalBreakdown = useMemo(() => {
    return goals.filter(g => !g.purchased).map(g => {
      const remaining = g.targetPrice - g.amountSaved
      const m = totalMonthly > 0 ? Math.ceil(remaining / totalMonthly) : 9999
      const date = new Date()
      date.setMonth(date.getMonth() + m)
      return { ...g, remaining, monthsNeeded: m, estimatedDate: date }
    }).sort((a, b) => a.monthsNeeded - b.monthsNeeded)
  }, [goals, totalMonthly])

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-2">Income Simulator</h1>
      <p className="text-white/40 text-sm mb-8">Adjust your income and savings to see when you'll complete your dreams</p>

      <div className="card p-6 mb-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-white/60">Monthly Income</label>
              <span className="text-sm font-semibold text-white">{symbol}{income.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="5000000"
              step="5000"
              value={income}
              onChange={e => setIncome(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-white/10 accent-purple-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>{symbol}10K</span>
              <span>{symbol}50L</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-white/60">Savings Rate</label>
              <span className="text-sm font-semibold text-white">{savingsRate}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              value={savingsRate}
              onChange={e => setSavingsRate(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-white/10 accent-purple-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>1%</span>
              <span>90%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-white/60">Business Profit Margin</label>
              <span className="text-sm font-semibold text-white">{profitMargin}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={profitMargin}
              onChange={e => setProfitMargin(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-white/10 accent-purple-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>10%</span>
              <span>90%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="text-xs text-white/40 mb-1">Monthly Savings</div>
          <div className="text-2xl font-bold text-emerald-400">
            <CountUp value={monthlySavings} symbol={symbol} />
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-white/40 mb-1">Months Required</div>
          <div className="text-2xl font-bold text-white">
            {months < 9999 ? months : "∞"}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-white/40 mb-1">Est. Completion Date</div>
          <div className="text-2xl font-bold text-purple-400">
            {months < 9999 ? estimatedDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Goal Completion Timeline</h2>
        <div className="space-y-2">
          {goalBreakdown.map(g => (
            <div key={g.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
              <div>
                <span className="text-sm text-white/80">{g.name}</span>
                <span className="text-xs text-white/30 ml-2">{g.category}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  {g.monthsNeeded < 9999 ? `${g.monthsNeeded} months` : "∞"}
                </div>
                <div className="text-xs text-white/30">
                  {g.monthsNeeded < 9999 ? g.estimatedDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
