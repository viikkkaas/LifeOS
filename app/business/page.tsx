"use client"

import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { getCurrencySymbol, formatCompactCurrency } from "@/lib/utils"
import CountUp from "@/components/ui/CountUp"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

export default function BusinessPage() {
  const { state, dispatch } = useApp()
  const { business, settings } = state.data
  const symbol = getCurrencySymbol(settings.currency, settings.customCurrencySymbol)

  const updateBusiness = (key: string, value: string) => {
    dispatch({ type: "UPDATE_BUSINESS", payload: { [key]: Number(value) || 0 } })
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white mb-6">Business Tracker</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="card-shell p-1">
                <div className="card-core p-6">
                  <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2 font-mono">
                    Revenue
                  </div>
                  <div className="text-3xl font-bold font-mono tracking-tight">
                    <CountUp value={business.revenue} symbol={symbol} />
                  </div>
                </div>
              </div>
              <div className="card-shell p-1">
                <div className="card-core p-6">
                  <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2 font-mono">
                    MRR
                  </div>
                  <div className="text-3xl font-bold font-mono tracking-tight">
                    <CountUp value={business.mrr} symbol={symbol} />
                  </div>
                </div>
              </div>
              <div className="card-shell p-1">
                <div className="card-core p-6">
                  <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2 font-mono">
                    Clients
                  </div>
                  <div className="text-3xl font-bold font-mono tracking-tight">
                    <CountUp value={business.clients} />
                  </div>
                </div>
              </div>
              <div className="card-shell p-1">
                <div className="card-core p-6">
                  <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2 font-mono">
                    Conversion
                  </div>
                  <div className="text-3xl font-bold font-mono tracking-tight">
                    <CountUp value={business.conversionRate} />%
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Editable fields */}
              <div className="card-shell p-1">
                <div className="card-core p-6 space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white/90">Metrics</h3>
                    <p className="text-xs text-white/40">Key business performance indicators</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Revenue", key: "revenue" },
                      { label: "MRR", key: "mrr" },
                      { label: "Clients", key: "clients" },
                      { label: "Meetings", key: "meetings" },
                      { label: "Cold Calls", key: "coldCalls" },
                      { label: "Deals Closed", key: "dealsClosed" },
                      { label: "Conversion Rate (%)", key: "conversionRate" },
                    ].map((field) => (
                      <div key={field.key} className="flex items-center gap-3">
                        <span className="text-sm text-white/60 w-36 flex-shrink-0">{field.label}</span>
                        <input
                          className="input-premium"
                          type="number"
                          value={(business as any)[field.key]}
                          onChange={(e) => updateBusiness(field.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="card-shell p-1">
                <div className="card-core p-6 space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white/90">Revenue Growth</h3>
                    <p className="text-xs text-white/40">Monthly revenue trend</p>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={business.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis
                        dataKey="month"
                        stroke="rgba(255,255,255,0.2)"
                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.2)"
                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#13131f",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: "8px",
                          color: "#fff",
                          padding: "8px 12px",
                        }}
                      />
                      <Bar
                        dataKey="revenue"
                        radius={[4, 4, 0, 0]}
                        fill="url(#revenueGradient)"
                      />
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}