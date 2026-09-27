"use client"

import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts"

interface ProfitabilityData {
  name: string
  revenue: number
  cost: number
}

interface RevenueGrowthData {
  month: string
  revenue: number
  profit: number
}

interface RevenueVsCostChartProps {
  data: ProfitabilityData[]
  height?: number
}

export function RevenueVsCostChart({ data, height = 380 }: RevenueVsCostChartProps) {
  if (data.length === 0) {
    return (
      <div className="card-shell p-1">
        <div className="card-core p-6 text-center py-8">
          <div className="text-white/30 text-[10px] font-mono">
            Add clients to see profitability comparison
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card-shell p-1"
      style={{ transition: "transform 0.3s ease" }}
    >
      <div className="card-core p-6">
        <h3 className="text-sm font-semibold text-white/90 mb-4">
          Revenue vs Infrastructure Cost
        </h3>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
              tickFormatter={(name: string) => name.length > 8 ? name.substring(0, 7) + "…" : name}
            />
            <YAxis
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
              tickFormatter={(v: number) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "#13131f",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                color: "#fff",
                padding: "8px 12px",
                fontSize: "13px",
              }}
              labelStyle={{ fontSize: "13px", fontWeight: 500 }}
              formatter={(value: any, name: any) => [`$${value}`, name]}
            />
            <Legend
              wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: -10 }}
              verticalAlign="top"
              height={36}
            />
            <Bar
              dataKey="revenue"
              name="Revenue"
              radius={[8, 8, 0, 0]}
              fill="url(#revenueGradient)"
              barSize={1.0}
              minBarSize={12}
            />
            <Bar
              dataKey="cost"
              name="Infrastructure Cost"
              radius={[8, 8, 0, 0]}
              fill="url(#costGradient)"
              barSize={1.0}
              minBarSize={12}
            />
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

interface RevenueGrowthChartProps {
  data: RevenueGrowthData[]
  height?: number
}

export function RevenueGrowthChart({ data, height = 300 }: RevenueGrowthChartProps) {
  if (data.length === 0) {
    return (
      <div className="card-shell p-1">
        <div className="card-core p-6 text-center py-8">
          <div className="text-white/30 text-[10px] font-mono">
            No revenue data available
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card-shell p-1"
    >
      <div className="card-core p-6">
        <h3 className="text-sm font-semibold text-white/90 mb-4">
          Monthly Revenue Trend
        </h3>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="month"
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              tickFormatter={(v: number) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "#13131f",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                color: "#fff",
                padding: "8px 12px",
                fontSize: "13px",
              }}
              labelStyle={{ fontSize: "13px", fontWeight: 500 }}
              formatter={(value: any) => `$${value}`}
            />
            <Legend
              wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: -10 }}
              verticalAlign="top"
              height={36}
            />
            <Bar
              dataKey="revenue"
              name="Revenue"
              radius={[6, 6, 0, 0]}
              fill="url(#revGrowthGradient)"
              barSize={0.9}
              minBarSize={12}
            />
            <Bar
              dataKey="profit"
              name="Profit"
              radius={[6, 6, 0, 0]}
              fill="url(#profitGradient)"
              barSize={0.9}
              minBarSize={12}
            />
            <defs>
              <linearGradient id="revGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

interface MarginAnalysisChartProps {
  scenarios: any[] // Array of scenarios with vol data
  height?: number
}

export function MarginAnalysisChart({ scenarios, height = 300 }: MarginAnalysisChartProps) {
  if (scenarios.length === 0) {
    return (
      <div className="card-shell p-1">
        <div className="card-core p-6 text-center py-8">
          <div className="text-white/30 text-[10px] font-mono">
            Save scenarios to see margin analysis
          </div>
        </div>
      </div>
    )
  }

  // Prepare data for grouped bar chart
  const volumes = [5, 10, 20, 30]
  const chartData = volumes.map((vol) => ({
    volume: vol,
    ...scenarios.reduce((acc, scenario, idx) => {
      const volData = scenario.vol.find((v: any) => v.n === vol)
      acc[`scenario${idx + 1}`] = volData ? volData.margin : 0
      return acc
    }, {} as Record<string, number>),
  }))

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card-shell p-1"
    >
      <div className="card-core p-6">
        <h3 className="text-sm font-semibold text-white/90 mb-4">
          Margin Analysis by Volume
        </h3>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="volume"
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              tickFormatter={(v: number) => `${v}%`}
              domain={[0, Math.max(100, Math.max(...scenarios.flatMap((s: any) => s.vol.map((v: any) => v.margin))) + 20)]}
            />
            <Tooltip
              contentStyle={{
                background: "#13131f",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                color: "#fff",
                padding: "8px 12px",
                fontSize: "13px",
              }}
              labelStyle={{ fontSize: "13px", fontWeight: 500 }}
              formatter={(value: any) => `${value}%`}
            />
            <Legend
              wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: -10 }}
              verticalAlign="top"
              height={36}
            />
            {scenarios.map((_, idx) => (
              <Bar
                key={`scenario${idx + 1}`}
                dataKey={`scenario${idx + 1}`}
                name={`Scenario ${idx + 1}`}
                radius={[4, 4, 0, 0]}
                fill={
                  idx === 0
                    ? "url(#marginGrad1)"
                    : idx === 1
                    ? "url(#marginGrad2)"
                    : "url(#marginGrad3)"
                }
                barSize={0.9}
                minBarSize={12}
              />
            ))}
            <defs>
              <linearGradient id="marginGrad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="marginGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="marginGrad3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}