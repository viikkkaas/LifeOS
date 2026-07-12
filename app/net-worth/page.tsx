"use client"

import { useEffect, useRef } from "react"
import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { getCurrencySymbol, formatCompactCurrency } from "@/lib/utils"
import CountUp from "@/components/ui/CountUp"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#43e97b", "#fa709a", "#a18cd1", "#fbc2eb"]

export default function NetWorthPage() {
  const { state, dispatch } = useApp()
  const { netWorth, settings, investments, business } = state.data
  const symbol = getCurrencySymbol(settings.currency, settings.customCurrencySymbol)
  const autoFilled = useRef(false)

  const investmentsTotalValue = investments.reduce((s, i) => s + i.amount + i.amount * (i.returns / 100), 0)
  const businessInvestmentsValue = investments.filter(i => i.type === "Business").reduce((s, i) => s + i.amount + i.amount * (i.returns / 100), 0)
  const computedBusinessValue = Math.max(businessInvestmentsValue, business.revenue)

  useEffect(() => {
    if (autoFilled.current) return
    const updates: Record<string, number> = {}
    if (netWorth.investments === 0 && investmentsTotalValue > 0) {
      updates.investments = investmentsTotalValue
    }
    if (netWorth.businessValue === 0 && computedBusinessValue > 0) {
      updates.businessValue = computedBusinessValue
    }
    if (Object.keys(updates).length > 0) {
      autoFilled.current = true
      dispatch({ type: "UPDATE_NET_WORTH", payload: updates })
    }
  }, [])

  const assets = [
    { label: "Cash", key: "cash", value: netWorth.cash },
    { label: "Investments", key: "investments", value: netWorth.investments },
    { label: "Stocks", key: "stocks", value: netWorth.stocks },
    { label: "Mutual Funds", key: "mutualFunds", value: netWorth.mutualFunds },
    { label: "Business Value", key: "businessValue", value: netWorth.businessValue },
    { label: "Gold", key: "gold", value: netWorth.gold },
    { label: "Crypto", key: "crypto", value: netWorth.crypto },
    { label: "Vehicles", key: "vehicles", value: netWorth.vehicles },
    { label: "Real Estate", key: "realEstate", value: netWorth.realEstate },
  ]

  const liabilities = [
    { label: "Loans", key: "loans", value: netWorth.loans },
    { label: "Credit Card", key: "creditCard", value: netWorth.creditCard },
    { label: "Mortgage", key: "mortgage", value: netWorth.mortgage },
  ]

  const totalAssets = assets.reduce((s, a) => s + a.value, 0)
  const totalLiabilities = liabilities.reduce((s, l) => s + l.value, 0)
  const totalNetWorth = totalAssets - totalLiabilities

  const updateAsset = (key: string, value: string) => {
    autoFilled.current = true
    dispatch({ type: "UPDATE_NET_WORTH", payload: { [key]: Number(value) || 0 } })
  }

  const assetData = assets.filter(a => a.value > 0).map(a => ({ name: a.label, value: a.value }))

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white mb-2">Net Worth</h1>
            <p className="text-white/40 text-sm mb-8">Track your assets and liabilities</p>

            {/* Net Worth Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="card p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full" />
                <div className="relative">
                  <div className="text-xs text-white/40 mb-1">Total Assets</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    <CountUp value={totalAssets} symbol={symbol} />
                  </div>
                </div>
              </div>
              <div className="card p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full" />
                <div className="relative">
                  <div className="text-xs text-white/40 mb-1">Total Liabilities</div>
                  <div className="text-2xl font-bold text-red-400">
                    <CountUp value={totalLiabilities} symbol={symbol} />
                  </div>
                </div>
              </div>
              <div className="card p-5 relative overflow-hidden gradient-border">
                <div className="relative">
                  <div className="text-xs text-white/40 mb-1">Net Worth</div>
                  <div className={`text-2xl font-bold ${totalNetWorth >= 0 ? "text-purple-400" : "text-red-400"}`}>
                    <CountUp value={totalNetWorth} symbol={symbol} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assets */}
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Assets</h2>
                <div className="space-y-3">
                  {assets.map(asset => (
                    <div key={asset.key} className="flex items-center gap-3">
                      <span className="text-sm text-white/60 w-28 flex-shrink-0">{asset.label}</span>
                      <input
                        className="input-premium"
                        type="number"
                        value={asset.value}
                        onChange={e => updateAsset(asset.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Liabilities */}
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Liabilities</h2>
                <div className="space-y-3">
                  {liabilities.map(liability => (
                    <div key={liability.key} className="flex items-center gap-3">
                      <span className="text-sm text-white/60 w-28 flex-shrink-0">{liability.label}</span>
                      <input
                        className="input-premium"
                        type="number"
                        value={liability.value}
                        onChange={e => updateAsset(liability.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                {/* Pie chart */}
                {assetData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xs text-white/40 mb-3">Asset Allocation</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={assetData} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value">
                          {assetData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", color: "#fff" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
