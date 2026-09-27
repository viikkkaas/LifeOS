"use client"

import { Plus, Trash2, TrendingUp, DollarSign, AlertTriangle } from "lucide-react"

interface Client {
  id: string
  name: string
  infraFee: number
  results: number
  perResultRate: number
  revenue?: number
  cost?: number
  profit?: number
  margin?: number
}

interface ClientTableProps {
  clients: Client[]
  rows: (Client & { revenue: number; cost: number; profit: number; margin: number })[]
  addClient: () => void
  updateClient: (id: string, key: string, value: string | number) => void
  removeClient: (id: string) => void
  money: (val: number, decimals?: number) => string
}

export function ClientTable({
  clients,
  rows,
  addClient,
  updateClient,
  removeClient,
  money,
}: ClientTableProps) {
  return (
    <div className="card-shell p-1">
      <div className="card-core p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white/90">
              Active Client Portfolio
            </h3>
            <p className="text-xs text-white/40 mt-0.5">
              Live unit economics and margin breakdown per customer
            </p>
          </div>
          <button
            onClick={addClient}
            className="btn-premium flex items-center gap-2 py-2 px-4 text-xs"
          >
            <Plus size={14} />
            <span>Add Client</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/[0.04]">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider font-mono">
                  Client Name
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider font-mono">
                  Base Fee ($/mo)
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider font-mono">
                  Volume (Results)
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider font-mono">
                  Rate ($/result)
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider font-mono text-right">
                  Revenue
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider font-mono text-right">
                  Alloc. Cost
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider font-mono text-right">
                  Net Profit
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider font-mono text-right">
                  Margin %
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider font-mono text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {rows.map((r) => {
                // Validation for input values
                const infraFeeValid = r.infraFee >= 0 && r.infraFee <= 10000
                const resultsValid = r.results >= 0 && r.results <= 1000
                const rateValid = r.perResultRate >= 0 && r.perResultRate <= 1000

                return (
                  <tr
                    key={r.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <input
                        className="input-premium py-1.5 px-3 text-xs w-full max-w-[160px] bg-transparent border-transparent hover:border-white/10 focus:border-indigo-500 focus:bg-white/[0.02]"
                        value={r.name}
                        placeholder="e.g. Acme Dental"
                        onChange={(e) => updateClient(r.id, "name", e.target.value)}
                      />
                    </td>

                    {/* Infra Fee */}
                    <td className="px-4 py-3">
                      <div className="relative w-24">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs">$</span>
                        <input
                          type="number"
                          className={`
                            input-premium pl-6 pr-2 py-1.5 text-xs font-mono text-right
                            ${!infraFeeValid ? 'border-red-400 bg-red-900/20' : ''}
                          `}
                          value={r.infraFee}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0
                            updateClient(r.id, "infraFee", value)
                          }}
                          onBlur={(e) => {
                            const value = Number(e.target.value) || 0
                            // Clamp to reasonable range
                            const clamped = Math.max(0, Math.min(10000, value))
                            if (clamped !== value) {
                              updateClient(r.id, "infraFee", clamped)
                            }
                          }}
                        />
                      </div>
                      {!infraFeeValid && (
                        <div className="text-xs text-red-400 mt-1">
                          Value must be between 0 and 10000
                        </div>
                      )}
                    </td>

                    {/* Results count */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className={`
                          input-premium py-1.5 px-2 text-xs font-mono text-center w-20
                          ${!resultsValid ? 'border-red-400 bg-red-900/20' : ''}
                        `}
                        value={r.results}
                        onChange={(e) => {
                          const value = Number(e.target.value) || 0
                          updateClient(r.id, "results", value)
                        }}
                        onBlur={(e) => {
                          const value = Number(e.target.value) || 0
                          // Clamp to reasonable range
                          const clamped = Math.max(0, Math.min(1000, value))
                          if (clamped !== value) {
                            updateClient(r.id, "results", clamped)
                          }
                        }}
                      />
                    </td>

                    {/* Rate per result */}
                    <td className="px-4 py-3">
                      <div className="relative w-24">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs">$</span>
                        <input
                          type="number"
                          className={`
                            input-premium pl-6 pr-2 py-1.5 text-xs font-mono text-right
                            ${!rateValid ? 'border-red-400 bg-red-900/20' : ''}
                          `}
                          value={r.perResultRate}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0
                            updateClient(r.id, "perResultRate", value)
                          }}
                          onBlur={(e) => {
                            const value = Number(e.target.value) || 0
                            // Clamp to reasonable range
                            const clamped = Math.max(0, Math.min(1000, value))
                            if (clamped !== value) {
                              updateClient(r.id, "perResultRate", clamped)
                            }
                          }}
                        />
                      </div>
                      {!rateValid && (
                        <div className="text-xs text-red-400 mt-1">
                          Value must be between 0 and 1000
                        </div>
                      )}
                    </td>

                    {/* Revenue */}
                    <td className="px-4 py-3 text-right font-mono text-xs font-medium text-white">
                      {money(r.revenue)}
                    </td>

                    {/* Allocated Cost */}
                    <td className="px-4 py-3 text-right font-mono text-xs text-white/50">
                      {money(r.cost)}
                    </td>

                    {/* Net Profit */}
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold">
                      <span
                        className={
                          r.profit >= 0 ? "text-emerald-400" : "text-red-400"
                        }
                      >
                        {money(r.profit)}
                      </span>
                    </td>

                    {/* Margin */}
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          r.margin >= 50
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : r.margin >= 20
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {r.margin.toFixed(1)}%
                      </span>
                    </td>

                    {/* Delete Action */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeClient(r.id)}
                        className="text-white/20 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-white/[0.04]"
                        title="Remove client"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-white/30 text-xs font-mono"
                  >
                    No active clients in portfolio. Click "Add Client" to begin tracking unit economics.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}