"use client"

import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { getCurrencySymbol } from "@/lib/utils"
import toast from "react-hot-toast"
import type { Theme, Currency } from "@/types"
import { Lock, Unlock, Download, Upload } from "lucide-react"

export default function SettingsPage() {
  const { state, dispatch } = useApp()
  const { settings, goals } = state.data

  const handleExport = (format: "csv" | "json") => {
    if (format === "json") {
      const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = `lifeos-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Data exported as JSON")
    } else {
      // Simple CSV export
      const headers = "Name,Category,TargetPrice,AmountSaved,Priority,TargetYear,Purchased,PurchaseDate,Notes\n"
      const rows = goals.map(g =>
        `"${g.name}","${g.category}",${g.targetPrice},${g.amountSaved},"${g.priority}",${g.targetYear},${g.purchased},"${g.purchaseDate || ""}","${g.notes.replace(/"/g, '""')}"`
      ).join("\n")
      const blob = new Blob([headers + rows], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = `lifeos-goals-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Data exported as CSV")
    }
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json,.csv"
    input.onchange = (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (data.goals) {
            dispatch({ type: "INIT", payload: data })
            toast.success("Data imported successfully!")
          } else {
            toast.error("Invalid file format")
          }
        } catch {
          toast.error("Failed to parse file")
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

            {/* Currency */}
            <div className="card p-6 mb-4">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Currency</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Currency Type</label>
                  <select
                    className="select-premium w-full"
                    value={settings.currency}
                    onChange={e => dispatch({ type: "UPDATE_SETTINGS", payload: { currency: e.target.value as Currency } })}
                  >
                    {["INR", "USD", "AED", "GBP", "EUR"].map(c => (
                      <option key={c} value={c}>{c} ({getCurrencySymbol(c)})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Custom Symbol (optional)</label>
                  <input
                    className="input-premium"
                    placeholder="Leave empty for default"
                    value={settings.customCurrencySymbol}
                    onChange={e => dispatch({ type: "UPDATE_SETTINGS", payload: { customCurrencySymbol: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            {/* Theme */}
            <div className="card p-6 mb-4">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Theme</h2>
              <div className="flex gap-3">
                {(["dark", "light", "oled"] as Theme[]).map(theme => (
                  <button
                    key={theme}
                    onClick={() => {
                      dispatch({ type: "UPDATE_SETTINGS", payload: { theme } })
                      document.documentElement.className = theme === "dark" ? "dark" : theme === "light" ? "theme-light" : "theme-oled"
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      settings.theme === theme
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-white/5 text-white/50 border border-transparent hover:text-white/70"
                    }`}
                  >
                    {theme === "dark" ? "🌙 Dark" : theme === "light" ? "☀️ Light" : "🖤 OLED Black"}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Settings */}
            <div className="card p-6 mb-4">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Financial Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Monthly Income</label>
                  <input
                    className="input-premium"
                    type="number"
                    value={settings.monthlyIncome}
                    onChange={e => dispatch({ type: "UPDATE_SETTINGS", payload: { monthlyIncome: Number(e.target.value) || 0 } })}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Savings Rate (%)</label>
                  <input
                    className="input-premium"
                    type="number"
                    min="1" max="90"
                    value={settings.savingsRate}
                    onChange={e => dispatch({ type: "UPDATE_SETTINGS", payload: { savingsRate: Number(e.target.value) || 0 } })}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Business Profit Margin (%)</label>
                  <input
                    className="input-premium"
                    type="number"
                    min="10" max="90"
                    value={settings.businessProfitMargin}
                    onChange={e => dispatch({ type: "UPDATE_SETTINGS", payload: { businessProfitMargin: Number(e.target.value) || 0 } })}
                  />
                </div>
              </div>
            </div>

            {/* Lock Mode */}
            <div className="card p-6 mb-4">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Security</h2>
              <button
                onClick={() => {
                  dispatch({ type: "SET_LOCKED", payload: !settings.locked })
                  toast.success(settings.locked ? "Unlocked" : "Locked")
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  settings.locked
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-white/5 text-white/50 border border-transparent hover:text-white/70"
                }`}
              >
                {settings.locked ? <Lock size={16} /> : <Unlock size={16} />}
                {settings.locked ? "Unlock App" : "Lock App"}
              </button>
            </div>

            {/* Export / Import */}
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Data</h2>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => handleExport("json")} className="btn-ghost flex items-center gap-2">
                  <Download size={14} /> Export JSON
                </button>
                <button onClick={() => handleExport("csv")} className="btn-ghost flex items-center gap-2">
                  <Download size={14} /> Export CSV
                </button>
                <button onClick={handleImport} className="btn-ghost flex items-center gap-2">
                  <Upload size={14} /> Import
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
