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
            <h1 className="text-2xl font-bold text-white mb-8">Business Tracker</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Revenue", value: business.revenue, symbol },
                { label: "MRR", value: business.mrr, symbol },
                { label: "Clients", value: business.clients, suffix: "" },
                { label: "Conversion", value: business.conversionRate, suffix: "%" },
              ].map((item, i) => (
                <div key={i} className="card p-4">
                  <div className="text-xs text-white/40 mb-1">{item.label}</div>
                  <div className="text-xl font-bold text-white">
                    {"symbol" in item ? <CountUp value={item.value} symbol={item.symbol} /> : <>{item.value}{item.suffix}</>}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Editable fields */}
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Metrics</h2>
                <div className="space-y-3">
                  {[
                    { label: "Revenue", key: "revenue" },
                    { label: "MRR", key: "mrr" },
                    { label: "Clients", key: "clients" },
                    { label: "Meetings", key: "meetings" },
                    { label: "Cold Calls", key: "coldCalls" },
                    { label: "Deals Closed", key: "dealsClosed" },
                    { label: "Conversion Rate (%)", key: "conversionRate" },
                  ].map(field => (
                    <div key={field.key} className="flex items-center gap-3">
                      <span className="text-sm text-white/60 w-36 flex-shrink-0">{field.label}</span>
                      <input
                        className="input-premium"
                        type="number"
                        value={(business as any)[field.key]}
                        onChange={e => updateBusiness(field.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Revenue Growth</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={business.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", color: "#fff" }} />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Additional KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Meetings", value: business.meetings, suffix: "" },
                { label: "Cold Calls", value: business.coldCalls, suffix: "" },
                { label: "Deals Closed", value: business.dealsClosed, suffix: "" },
                { label: "Conversion", value: business.conversionRate, suffix: "%" },
              ].map((item, i) => (
                <div key={i} className="card p-3">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{item.label}</div>
                  <div className="text-lg font-bold text-white">{item.value}{item.suffix}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
