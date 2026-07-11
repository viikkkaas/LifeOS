"use client"

import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { getCurrencySymbol, formatCompactCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts"
import CountUp from "@/components/ui/CountUp"

const COLORS = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#43e97b", "#fa709a", "#a18cd1", "#fbc2eb"]

export default function AnalyticsPage() {
  const { state } = useApp()
  const { goals, netWorth, settings, investments } = state.data
  const symbol = getCurrencySymbol(settings.currency, settings.customCurrencySymbol)

  // Goal distribution by category
  const categoryData = goals.reduce((acc: any[], goal) => {
    const existing = acc.find(c => c.name === goal.category)
    if (existing) {
      existing.value += goal.targetPrice
      existing.count++
    } else {
      acc.push({ name: goal.category, value: goal.targetPrice, count: 1 })
    }
    return acc
  }, [])

  // Net worth growth (simulated monthly data)
  const netWorthData = [
    { month: "Jan", netWorth: netWorth.cash + netWorth.investments - netWorth.loans },
    { month: "Feb", netWorth: (netWorth.cash + netWorth.investments - netWorth.loans) * 1.02 },
    { month: "Mar", netWorth: (netWorth.cash + netWorth.investments - netWorth.loans) * 1.04 },
    { month: "Apr", netWorth: (netWorth.cash + netWorth.investments - netWorth.loans) * 1.06 },
    { month: "May", netWorth: (netWorth.cash + netWorth.investments - netWorth.loans) * 1.08 },
    { month: "Jun", netWorth: (netWorth.cash + netWorth.investments - netWorth.loans) * 1.10 },
  ]

  // Dream progress data
  const dreamProgress = goals.map(g => ({
    name: g.name.length > 15 ? g.name.slice(0, 15) + "..." : g.name,
    progress: Math.round((g.amountSaved / g.targetPrice) * 100),
    purchased: g.purchased,
  }))

  // Savings by month (simulated from goals data)
  const savingsByMonth = [
    { month: "Jan", saved: goals.reduce((s, g) => s + g.amountSaved * 0.15, 0) },
    { month: "Feb", saved: goals.reduce((s, g) => s + g.amountSaved * 0.1, 0) },
    { month: "Mar", saved: goals.reduce((s, g) => s + g.amountSaved * 0.12, 0) },
    { month: "Apr", saved: goals.reduce((s, g) => s + g.amountSaved * 0.18, 0) },
    { month: "May", saved: goals.reduce((s, g) => s + g.amountSaved * 0.08, 0) },
    { month: "Jun", saved: goals.reduce((s, g) => s + g.amountSaved * 0.2, 0) },
  ]

  // Investment allocation
  const investmentData = investments.map(i => ({
    name: i.type,
    value: i.amount,
  }))

  // Totals
  const totalInvested = investments.reduce((s, i) => s + i.amount, 0)
  const totalReturns = investments.reduce((s, i) => s + i.amount * (i.returns / 100), 0)
  const purchased = goals.filter(g => g.purchased).length
  const pending = goals.filter(g => !g.purchased).length

  const totalAssets = netWorth.cash + netWorth.investments + netWorth.stocks + netWorth.mutualFunds + netWorth.businessValue + netWorth.gold + netWorth.crypto + netWorth.vehicles + netWorth.realEstate
  const totalLiabilities = netWorth.loans + netWorth.creditCard + netWorth.mortgage

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white mb-8">Analytics</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Total Invested", value: totalInvested, symbol },
                { label: "Returns", value: totalReturns, symbol },
                { label: "Purchased", value: purchased, suffix: " goals" },
                { label: "Pending", value: pending, suffix: " goals" },
              ].map((item, i) => (
                <div key={i} className="card p-4">
                  <div className="text-xs text-white/40 mb-1">{item.label}</div>
                  <div className="text-xl font-bold text-white">
                    {"symbol" in item ? (
                      <CountUp value={item.value} symbol={item.symbol} />
                    ) : (
                      <>{item.value}{item.suffix}</>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Net Worth Growth */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Net Worth Growth</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={netWorthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", color: "#fff" }}
                    />
                    <Line type="monotone" dataKey="netWorth" stroke="#667eea" strokeWidth={2} dot={{ fill: "#667eea" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Dream Progress */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Dream Progress</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dreamProgress} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={120} stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", color: "#fff" }}
                    />
                    <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                      {dreamProgress.map((_, i) => (
                        <Cell key={i} fill={dreamProgress[i].purchased ? "#34d399" : COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Goal Distribution */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Goal Distribution by Category</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-3">
                  {categoryData.map((c, i) => (
                    <span key={i} className="text-xs text-white/50 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Savings by Month */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Savings by Month</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={savingsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", color: "#fff" }}
                    />
                    <Bar dataKey="saved" radius={[4, 4, 0, 0]} fill="#764ba2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Investment Allocation */}
            {investmentData.length > 0 && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Investment Allocation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={investmentData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value">
                        {investmentData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col justify-center gap-3">
                    {investmentData.map((inv, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-sm text-white/60">{inv.name}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{symbol}{formatCompactCurrency(inv.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Money Needed - Goals to complete */}
            <div className="card p-5 mt-6">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Money Needed to Complete All Goals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-white/40 mb-1">Total Goal Cost</div>
                  <div className="text-2xl font-bold text-white">{symbol}{formatCompactCurrency(goals.reduce((s, g) => s + g.targetPrice, 0))}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 mb-1">Total Saved</div>
                  <div className="text-2xl font-bold text-emerald-400">{symbol}{formatCompactCurrency(goals.reduce((s, g) => s + g.amountSaved, 0))}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 mb-1">Still Needed</div>
                  <div className="text-2xl font-bold text-amber-400">{symbol}{formatCompactCurrency(goals.reduce((s, g) => s + (g.targetPrice - g.amountSaved), 0))}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
