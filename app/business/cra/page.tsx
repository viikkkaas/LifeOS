"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { Plus, Trash2, Save, Calculator, Table2, X, Activity, RefreshCw } from "lucide-react"

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

import { CostInputs } from "@/components/business/cra/CostInputs"
import { ClientTable } from "@/components/business/cra/ClientTable"
import { ScenarioCards } from "@/components/business/cra/ScenarioCards"
import { SummaryCard } from "@/components/business/cra/SummaryCard"
import { RevenueVsCostChart, RevenueGrowthChart, MarginAnalysisChart } from "@/components/business/cra/ChartComponents"

import { getCurrencySymbol, formatCompactCurrency } from "@/lib/utils"

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

interface CostDefaults {
  ec2: number
  ebs: number
  dataTransfer: number
  telnyx: number
  retell: number
  amplify: number
  workspacePerUser: number
  workspaceUsers: number
  legalOneTime: number
}

interface Client {
  id: string
  name: string
  infraFee: number
  results: number
  perResultRate: number
}

interface Scenario {
  id: string
  name: string
  infraFee: number
  perResultRate: number
  expectedResults: number
  retellTier: "payg" | "committed"
  minutesPerResult: number
}

interface State {
  costs: CostDefaults
  clients: Client[]
  scenario: Scenario
  savedScenarios: Scenario[]
  compareIds: string[]
}

/* ------------------------------------------------------------------ *
 * Defaults
 * ------------------------------------------------------------------ */

const DEFAULT_COSTS: CostDefaults = {
  ec2: 38,           // 36-40
  ebs: 4.5,          // 4-5
  dataTransfer: 3.5, // 2-5
  telnyx: 50,        // 20-80
  retell: 60,        // $0 base + $0.01/min redaction (actual, editable)
  amplify: 12.5,     // 5-20 shared
  workspacePerUser: 7,
  workspaceUsers: 1,
  legalOneTime: 550, // 300-800 one-time
}

const DEFAULT_STATE: () => State = () => ({
  costs: { ...DEFAULT_COSTS },
  clients: [
    {
      id: crypto.randomUUID(),
      name: "Sunrise Dental",
      infraFee: 250,
      results: 12,
      perResultRate: 40,
    },
    {
      id: crypto.randomUUID(),
      name: "Bright Smile Ortho",
      infraFee: 200,
      results: 8,
      perResultRate: 35,
    },
  ],
  scenario: {
    id: "live",
    name: "Current quote",
    infraFee: 200,
    perResultRate: 40,
    expectedResults: 15,
    retellTier: "committed",
    minutesPerResult: 12,
  },
  savedScenarios: [],
  compareIds: [],
})

const STORAGE_KEY = "lifeos-cra-tool-v1"

/* ------------------------------------------------------------------ *
 * Persistence
 * ------------------------------------------------------------------ */

function loadState(): State {
  if (typeof window === "undefined") return DEFAULT_STATE()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE()
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_STATE(),
      ...parsed,
      costs: { ...DEFAULT_COSTS, ...(parsed.costs || {}) },
      scenario: { ...DEFAULT_STATE().scenario, ...(parsed.scenario || {}) },
    }
  } catch {
    return DEFAULT_STATE()
  }
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

/* ------------------------------------------------------------------ *
 * Cost / margin helpers
 * ------------------------------------------------------------------ */

function perClientVariableCosts(c: CostDefaults): number {
  return c.ec2 + c.ebs + c.dataTransfer + c.telnyx + c.retell
}

/* Allocated infra cost for one client given N active clients. */
function allocatedPerClient(c: CostDefaults, activeClients: number): number {
  const shared =
    c.amplify + c.workspacePerUser * c.workspaceUsers
  const perClient = perClientVariableCosts(c)
  const n = Math.max(1, activeClients)
  return perClient + shared / n
}

/* ------------------------------------------------------------------ *
 * Main Component
 * ------------------------------------------------------------------ */

export default function CRAssistantPage() {
  const [state, setState] = useState<State>(DEFAULT_STATE)
  const [loaded, setLoaded] = useState(false)
  const [tab, setTab] = useState<"tracker" | "calc">("tracker")
  const [scenarioName, setScenarioName] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const s = loadState()
    setState(s)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore quota errors */
    }
  }, [state, loaded])

  const patch = (p: Partial<State>) => setState(s => ({ ...s, ...p }))
  const patchCosts = (p: Partial<CostDefaults>) =>
    setState(s => ({ ...s, costs: { ...s.costs, ...p } }))
  const patchScenario = (p: Partial<Scenario>) =>
    setState(s => ({ ...s, scenario: { ...s.scenario, ...p } }))

  const clientCount = state.clients.length

  const trackerRows = useMemo(
    () =>
      state.clients.map((cl) => {
        const revenue = cl.infraFee + cl.results * cl.perResultRate
        const cost = allocatedPerClient(state.costs, clientCount)
        const profit = revenue - cost
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0
        return { ...cl, revenue, cost, profit, margin }
      }),
    [state.clients, state.costs, clientCount]
  )

  const summary = useMemo(() => {
    const totalRevenue = trackerRows.reduce((a, r) => a + r.revenue, 0)
    const totalCost = trackerRows.reduce((a, r) => a + r.cost, 0)
    const totalProfit = totalRevenue - totalCost
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    return { totalRevenue, totalCost, totalProfit, avgMargin }
  }, [trackerRows])

  /* ---- Calculator ---- */

  const sc = state.scenario

  const calcVolume = useCallback((results: number) => {
    const minutes = sc.minutesPerResult * results
    let retell = minutes * 0.01 // redaction always
    if (sc.retellTier === "committed") {
      retell += 350 // 2000-min committed tier flat
    } else {
      retell += minutes * 0.175
    }
    const fixed = state.costs.ec2 + state.costs.ebs
    const callVar = state.costs.dataTransfer + state.costs.telnyx
    const shared = state.costs.amplify + state.costs.workspacePerUser * state.costs.workspaceUsers
    // call-related costs scale with volume, EC2/EBS/shared fixed
    const infra = fixed + callVar * (minutes / 1000) + callVar * (results / 10) + shared + retell
    const revenue = sc.infraFee + results * sc.perResultRate
    const gross = revenue - infra
    return {
      results,
      minutes,
      retell,
      infra,
      revenue,
      gross,
      margin: revenue > 0 ? (gross / revenue) * 100 : 0,
    }
  }, [sc, state.costs])

  const liveCalc = calcVolume(sc.expectedResults)

  const breakeven = useMemo(() => {
    // results where infra == revenue, scanning upward
    for (let r = 0; r <= 500; r++) {
      const rev = sc.infraFee + r * sc.perResultRate
      const c = calcVolume(r).infra
      if (rev >= c) return r
    }
    return 501
  }, [calcVolume, sc])

  const volumeRows = useMemo(
    () => [5, 10, 20, 30].map(n => calcVolume(n)),
    [calcVolume]
  )

  /* ---- Scenario save / compare ---- */

  const saveScenario = () => {
    const s: Scenario = { ...sc, id: uid() }
    patch({
      savedScenarios: [...state.savedScenarios, s],
      compareIds: state.compareIds.length
        ? [...state.compareIds, s.id]
        : [s.id],
    })
    setScenarioName("")
    toast.success("Scenario saved")
  }

  const deleteScenario = (id: string) => {
    const stillThere = state.savedScenarios.filter(x => x.id !== id)
    // swap the id out of compare, and if any compare id is now gone, add the first remaining
    patch({
      savedScenarios: stillThere,
      compareIds: state.compareIds.filter(
        cid => cid !== id && stillThere.some(x => x.id === cid)
      ),
    })
  }

  const toggleCompare = (id: string) => {
    let next = state.compareIds.includes(id)
      ? state.compareIds.filter(x => x !== id)
      : [...state.compareIds, id]
    if (next.length > 3) next = next.slice(next.length - 3)
    patch({ compareIds: next })
  }

  const compareScenarios: any[] = useMemo(() => {
    const ids = state.compareIds
    const list: any[] = []
    for (const id of ids) {
      const found = state.savedScenarios.find(x => x.id === id)
      if (found) {
        // compute over live volumes
        const vol = [5, 10, 20, 30].map(n => {
          const minutes = found.minutesPerResult * n
          let retell = minutes * 0.01
          if (found.retellTier === "committed") retell += 350
          else retell += minutes * 0.175
          const fixed = state.costs.ec2 + state.costs.ebs
          const callVar = state.costs.dataTransfer + state.costs.telnyx
          const shared = state.costs.amplify + state.costs.workspacePerUser * state.costs.workspaceUsers
          const infra = fixed + callVar * (minutes / 1000) + callVar * (n / 10) + shared + retell
          const revenue = found.infraFee + n * found.perResultRate
          const gross = revenue - infra
          return {
            n,
            revenue,
            gross,
            margin: revenue > 0 ? (gross / revenue) * 100 : 0,
            infra,
          }
        })
        list.push({ ...found, vol })
      }
    }
    return list
  }, [state.compareIds, state.savedScenarios, state.costs])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Simulate a brief refresh delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800))
      // Reload from localStorage to ensure we have latest data
      const s = loadState()
      setState(s)
      toast.success("Data refreshed")
    } catch (error) {
      toast.error("Failed to refresh data")
    } finally {
      setRefreshing(false)
    }
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-white/20 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-white/60">Loading financial data...</p>
          </div>
        </div>
      </div>
    )
  }

  const money = (n: number, d = 0) =>
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    })

  const inputCls =
    "input-premium"
  const labelCls = "text-xs text-white/40 mb-1"
  const thCls =
    "text-left text-xs font-semibold text-white/40 uppercase tracking-wider px-3 py-2"
  const tdCls = "px-3 py-2 text-sm text-white/90"

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">CareReceptionist AI</h1>
                <p className="text-sm text-white/40 mt-1">
                  Internal tool — financial tracking & pricing for dental-clinic
                  receptionist SaaS. Local only, no auth.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTab("tracker")}
                  className={
                    tab === "tracker"
                      ? "btn-premium"
                      : "btn-ghost"
                  }
                >
                  <span className="flex items-center gap-2"><Table2 size={15} /> Financial Tracker</span>
                </button>
                <button
                  onClick={() => setTab("calc")}
                  className={
                    tab === "calc"
                      ? "btn-premium"
                      : "btn-ghost"
                  }
                >
                  <span className="flex items-center gap-2"><Calculator size={15} /> Pricing Calculator</span>
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={`
                    btn-ghost flex items-center gap-2
                    ${refreshing ? 'opacity-50' : 'hover:text-white transition-opacity'}
                  `}
                >
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                  <span>{refreshing ? 'Refreshing' : 'Refresh Data'}</span>
                </button>
              </div>
            </div>

            {tab === "tracker" && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <SummaryCard
                    label="Total Revenue"
                    value={money(summary.totalRevenue)}
                    tone="text-white"
                  />
                  <SummaryCard
                    label="Total Costs"
                    value={money(summary.totalCost)}
                    tone="text-red-300"
                    isPositive={false}
                  />
                  <SummaryCard
                    label="Total Profit"
                    value={money(summary.totalProfit)}
                    tone={summary.totalProfit >= 0 ? "text-emerald-300" : "text-red-300"}
                    isPositive={summary.totalProfit >= 0}
                    trend={`${Math.abs(summary.totalProfit).toFixed(0)} / mo`}
                    subtext="Net"
                  />
                  <SummaryCard
                    label="Avg Margin"
                    value={summary.avgMargin.toFixed(1) + "%"}
                    tone={summary.avgMargin >= 0 ? "text-emerald-300" : "text-red-300"}
                    isPositive={summary.avgMargin >= 0}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Cost Inputs */}
                  <CostInputs
                    costs={state.costs}
                    clientCount={clientCount}
                    patchCosts={patchCosts}
                  />

                  {/* Client Table */}
                  <ClientTable
                    clients={state.clients}
                    rows={trackerRows}
                    addClient={() => {
                      const cl = {
                        id: uid(),
                        name: "New client",
                        infraFee: 200,
                        results: 5,
                        perResultRate: 40,
                      }
                      patch({ clients: [...state.clients, cl] })
                      toast.success("Client added")
                    }}
                    updateClient={(id: string, key: string, value: string | number) => {
                      patch({
                        clients: state.clients.map((c: Client) =>
                          c.id === id
                            ? { ...c, [key]: typeof value === "string" ? Number(value) || 0 : value }
                            : c
                        ),
                      })
                    }}
                    removeClient={(id: string) => {
                      patch({ clients: state.clients.filter((c: Client) => c.id !== id) })
                      toast.success("Client removed")
                    }}
                    money={money}
                  />

                  {/* Revenue vs Cost Chart */}
                  <div className="col-span-2">
                    <RevenueVsCostChart data={trackerRows} />
                  </div>
                </div>
              </>
            )}

            {tab === "calc" && (
              <>
                {/* Live Result Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <SummaryCard
                    label="Monthly Revenue"
                    value={money(liveCalc.revenue, 0)}
                    tone="text-white"
                  />
                  <SummaryCard
                    label="Infra Cost"
                    value={money(liveCalc.infra, 0)}
                    tone="text-red-300"
                    isPositive={false}
                  />
                  <SummaryCard
                    label="Gross Margin"
                    value={
                      money(liveCalc.gross, 0) +
                        " (" +
                        liveCalc.margin.toFixed(1) +
                        "%)"
                    }
                    tone={liveCalc.gross >= 0 ? "text-emerald-300" : "text-red-300"}
                    isPositive={liveCalc.gross >= 0}
                  />
                  <SummaryCard
                    label="Breakeven Results"
                    value={String(breakeven <= 500 ? breakeven : ">500")}
                    tone="text-sky-300"
                  />
                </div>

                {/* Inputs Section */}
                <div className="card-shell p-1 mb-6">
                  <div className="card-core p-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-white/90">
                        Scenario Inputs
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const base = (sc.infraFee * sc.perResultRate).toString()
                            setScenarioName(
                              `Scenario ${String(state.savedScenarios.length + 1)}: $${sc.infraFee} infra + $${sc.perResultRate}/result`
                            )
                          }}
                          className="btn-ghost text-xs"
                        >
                          Auto-name
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                      <div>
                        <label className={labelCls}>Monthly infra fee (client pays)</label>
                        <div className="flex items-center gap-1">
                          <span className="text-white/50">$</span>
                          <input
                            className={inputCls}
                            type="number"
                            value={sc.infraFee}
                            onChange={e =>
                              patchScenario({ infraFee: Number(e.target.value) || 0 })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Per-result rate (client pays)</label>
                        <div className="flex items-center gap-1">
                          <span className="text-white/50">$</span>
                          <input
                            className={inputCls}
                            type="number"
                            value={sc.perResultRate}
                            onChange={e =>
                              patchScenario({ perResultRate: Number(e.target.value) || 0 })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Expected results / month</label>
                        <input
                          className={inputCls}
                          type="range"
                          min={0}
                          max={60}
                          value={sc.expectedResults}
                          onChange={e =>
                            patchScenario({ expectedResults: Number(e.target.value) })}
                        />
                        <div className="text-sm text-white/70 mt-1">{sc.expectedResults} results</div>
                      </div>
                      <div>
                        <label className={labelCls}>Retell tier</label>
                        <select
                          className="select-premium w-full"
                          value={sc.retellTier}
                          onChange={e =>
                            patchScenario({ retellTier: e.target.value as "payg" | "committed" })
                          }
                        >
                          <option value="payg">Pay-as-you-go $0.175/min</option>
                          <option value="committed">Committed 2000-min $350/mo</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Avg call minutes / result</label>
                        <input
                          className={inputCls}
                          type="number"
                          value={sc.minutesPerResult}
                          onChange={e =>
                            patchScenario({ minutesPerResult: Number(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Volume Table */}
                  <div className="card-shell p-1">
                    <div className="card-core p-6 space-y-4">
                      <h3 className="text-sm font-semibold text-white/90 mb-4">
                        Margin at Different Volumes
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] border-collapse divide-y divide-white/[0.04]">
                          <thead>
                            <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                              <th className={thCls}>Results/mo</th>
                              <th className={thCls}>Call min</th>
                              <th className={thCls}>Revenue</th>
                              <th className={thCls}>Infra cost</th>
                              <th className={thCls}>Gross $</th>
                              <th className={thCls}>Margin %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {volumeRows.map((r: any) => (
                              <tr
                                key={r.results}
                                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                              >
                                <td className={tdCls + " font-medium whitespace-nowrap text-right"}>
                                  {r.results}
                                </td>
                                <td className={tdCls}>{Math.round(r.minutes)}</td>
                                <td className={tdCls + " text-right font-mono"}>{money(r.revenue, 0)}</td>
                                <td className={tdCls + " text-right text-white/50"}>{money(r.infra, 0)}</td>
                                <td className={tdCls + (r.gross >= 0 ? " text-emerald-300" : " text-red-300")} text-right font-mono>
                                  {money(r.gross, 0)}
                                </td>
                                <td className={tdCls + (r.margin >= 0 ? " text-emerald-300" : " text-red-300")} text-right font-mono>
                                  {r.margin.toFixed(1)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 gap-6">
                      <RevenueGrowthChart
                        data={[
                          { month: "Jan", revenue: 0, profit: 0 },
                          { month: "Feb", revenue: 0, profit: 0 },
                          { month: "Mar", revenue: 0, profit: 0 },
                          { month: "Apr", revenue: 0, profit: 0 },
                          { month: "May", revenue: 0, profit: 0 },
                          { month: "Jun", revenue: 0, profit: 0 },
                          { month: "Jul", revenue: 0, profit: 0 },
                          { month: "Aug", revenue: 0, profit: 0 },
                          { month: "Sep", revenue: 0, profit: 0 },
                          { month: "Oct", revenue: 0, profit: 0 },
                          { month: "Nov", revenue: 0, profit: 0 },
                          { month: "Dec", revenue: 0, profit: 0 },
                        ].map((d, idx) => ({
                          ...d,
                          revenue: liveCalc.revenue * (0.8 + 0.4 * Math.sin(idx * 0.5)),
                          profit: liveCalc.gross * (0.8 + 0.4 * Math.sin(idx * 0.5)),
                        }))}
                      />
                      <MarginAnalysisChart scenarios={compareScenarios} />
                    </div>
                  </div>
                </div>

                {/* Scenario Management */}
                <ScenarioCards
                  state={state}
                  patch={patch}
                  saveScenario={saveScenario}
                  deleteScenario={deleteScenario}
                  toggleCompare={toggleCompare}
                  compareScenarios={compareScenarios}
                  scenarioName={scenarioName}
                  setScenarioName={setScenarioName}
                />
              </>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}