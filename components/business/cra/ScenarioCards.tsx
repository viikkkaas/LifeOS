"use client"

import { Trash2, Activity, X } from "lucide-react"

interface Scenario {
  id: string
  name: string
  infraFee: number
  perResultRate: number
  expectedResults: number
  retellTier: "payg" | "committed"
  minutesPerResult: number
}

interface ScenarioCardsProps {
  state: any
  patch: (p: Partial<any>) => void
  saveScenario: () => void
  deleteScenario: (id: string) => void
  toggleCompare: (id: string) => void
  compareScenarios: any[]
  scenarioName: string
  setScenarioName: (name: string) => void
}

export function ScenarioCards({
  state,
  patch,
  saveScenario,
  deleteScenario,
  toggleCompare,
  compareScenarios,
  scenarioName,
  setScenarioName,
}: ScenarioCardsProps) {
  return (
    <>
      {/* Save Scenario Section */}
      <div className="card-shell p-1">
        <div className="card-core p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white/90">
                Pricing Scenarios
              </h3>
              <p className="text-xs text-white/40 mt-0.5">
                Save and compare different pricing configurations
              </p>
            </div>
            <div className="flex gap-2 items-end">
              <input
                type="text"
                placeholder="Scenario name (optional)"
                className="input-premium max-w-xs px-3 py-2 text-sm"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
              />
              <button
                onClick={saveScenario}
                className="btn-premium flex items-center gap-2 px-4 py-2 text-xs"
              >
                <Activity size={14} />
                <span>Save Scenario</span>
              </button>
            </div>
          </div>

          {/* Saved Scenarios Grid */}
          {state.savedScenarios.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.savedScenarios.map((s: any) => {
                const selected = state.compareIds.includes(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleCompare(s.id)}
                    className={
                      "flex flex-col p-5 rounded-lg border transition-all duration-300 group" +
                      (selected
                        ? "border-[#667eea] bg-[#667eea]/10"
                        : "border-white/8 bg-white/[0.02] hover:border-white/20")
                    }
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-white">{s.name || "Untitled Scenario"}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteScenario(s.id)
                        }}
                        className="text-white/30 hover:text-red-400 transition-colors p-1 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="space-y-2 text-xs text-white/50 font-mono">
                      <div>
                        ${s.infraFee} infra + ${s.perResultRate}/result
                      </div>
                      <div>
                        ~{s.expectedResults} results/mo
                      </div>
                      <div>
                        {s.retellTier === "committed"
                          ? "Committed $350/mo Retell"
                          : "Pay-as-you-go Retell"} · {s.minutesPerResult} min/result
                      </div>
                      {selected && (
                        <div className="mt-2 flex items-center gap-1 text-[10px]">
                          <span className="text-[#667eea] font-medium">In comparison</span>
                          <span className="text-white/30">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Section */}
      {compareScenarios.length > 0 && (
        <div className="card-shell p-1 mt-6">
          <div className="card-core p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/90">
                Scenario Comparison
              </h3>
              <div className="flex items-center gap-2">
                <X size={14} className="text-white/40" />
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Side-by-side analysis
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse divide-y divide-white/[0.04]">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                    <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider font-mono text-left">
                      Metric
                    </th>
                    {compareScenarios.map((c: any) => (
                      <th
                        key={c.id}
                        className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider font-mono"
                      >
                        {c.name || "Untitled"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[5, 10, 20, 30].map((n) => (
                    <tr key={n} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-[10px] font-medium text-white/80 font-mono whitespace-nowrap">
                        {n} results/mo
                      </td>
                      {compareScenarios.map((c: any) => {
                        const v = c.vol.find((x: any) => x.n === n)
                        return (
                          <td
                            key={c.id}
                            className="px-4 py-3 text-[10px] font-mono text-right whitespace-nowrap"
                          >
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-white">
                                ${v.gross.toFixed(0)}
                              </span>
                              <span className="text-xs text-white/40">
                                {v.margin.toFixed(0)}% margin
                              </span>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  )
}