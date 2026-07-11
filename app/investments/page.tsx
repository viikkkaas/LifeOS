"use client"

import { useState } from "react"
import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { getCurrencySymbol, formatCompactCurrency, generateId } from "@/lib/utils"
import CountUp from "@/components/ui/CountUp"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Plus, Trash2 } from "lucide-react"
import type { Investment } from "@/types"
import toast from "react-hot-toast"

const COLORS = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#43e97b"]
const TYPES = ["Mutual Funds", "Stocks", "Crypto", "Gold", "Business"] as const

export default function InvestmentsPage() {
  const { state, dispatch } = useApp()
  const { investments, settings } = state.data
  const symbol = getCurrencySymbol(settings.currency, settings.customCurrencySymbol)

  const [showAdd, setShowAdd] = useState(false)
  const [type, setType] = useState<Investment["type"]>("Mutual Funds")
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [returns, setReturns] = useState("")

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0)
  const totalReturns = investments.reduce((s, i) => s + i.amount * (i.returns / 100), 0)

  const chartData = investments.map(i => ({ name: i.name, value: i.amount, type: i.type }))

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !amount) { toast.error("Name and amount required"); return }
    const inv: Investment = {
      id: generateId(), type, name: name.trim(),
      amount: Number(amount) || 0, returns: Number(returns) || 0,
      allocation: 0,
    }
    dispatch({ type: "ADD_INVESTMENT", payload: inv })
    toast.success("Investment added")
    setName(""); setAmount(""); setReturns(""); setShowAdd(false)
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white">Investments</h1>
                <p className="text-white/40 text-sm mt-1">Track your portfolio</p>
              </div>
              <button onClick={() => setShowAdd(!showAdd)} className="btn-premium flex items-center gap-2">
                <Plus size={16} /> Add Investment
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="card p-4">
                <div className="text-xs text-white/40 mb-1">Total Invested</div>
                <div className="text-xl font-bold text-white"><CountUp value={totalInvested} symbol={symbol} /></div>
              </div>
              <div className="card p-4">
                <div className="text-xs text-white/40 mb-1">Total Returns</div>
                <div className="text-xl font-bold text-emerald-400"><CountUp value={totalReturns} symbol={symbol} /></div>
              </div>
              <div className="card p-4">
                <div className="text-xs text-white/40 mb-1">ROI</div>
                <div className="text-xl font-bold text-purple-400">{totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(1) : 0}%</div>
              </div>
              <div className="card p-4">
                <div className="text-xs text-white/40 mb-1">Total Value</div>
                <div className="text-xl font-bold text-white"><CountUp value={totalInvested + totalReturns} symbol={symbol} /></div>
              </div>
            </div>

            {/* Add form */}
            <AnimatePresence>
              {showAdd && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                  <form onSubmit={handleAdd} className="card p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">New Investment</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <select className="select-premium" value={type} onChange={e => setType(e.target.value as any)}>
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input className="input-premium" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                      <input className="input-premium" type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
                      <input className="input-premium" type="number" placeholder="Returns %" value={returns} onChange={e => setReturns(e.target.value)} />
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
                      <button type="submit" className="btn-premium">Add</button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* List */}
              <div className="space-y-2">
                {investments.map((inv, i) => (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="card p-4 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <div>
                        <div className="text-sm font-medium text-white">{inv.name}</div>
                        <div className="text-xs text-white/30">{inv.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{formatCompactCurrency(inv.amount, symbol)}</div>
                        <div className={`text-xs ${inv.returns >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {inv.returns >= 0 ? '+' : ''}{inv.returns}%
                        </div>
                      </div>
                      <button
                        onClick={() => { dispatch({ type: "DELETE_INVESTMENT", payload: inv.id }); toast.success("Removed") }}
                        className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pie Chart with Legend */}
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Allocation</h2>
                {chartData.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value">
                          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", color: "#fff" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 mt-2">
                      {chartData.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-white/60">{item.name}</span>
                          <span className="text-white/30">({item.type})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/30 text-sm">No investments yet</div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
