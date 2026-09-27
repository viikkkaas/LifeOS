"use client"

import { HelpCircle, AlertTriangle } from "lucide-react"

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

interface CostInputsProps {
  costs: CostDefaults
  clientCount: number
  patchCosts: (costs: Partial<CostDefaults>) => void
}

export function CostInputs({ costs, clientCount, patchCosts }: CostInputsProps) {
  const costFields = [
    {
      key: "ec2" as const,
      label: "EC2 t3.medium",
      sublabel: "Mumbai Region",
      tooltip: "Hosting infrastructure ($36-40/mo typically)",
      min: 0,
      max: 100,
      warningMin: 30,
      warningMax: 50
    },
    {
      key: "ebs" as const,
      label: "EBS Storage",
      sublabel: "50GB GP3",
      tooltip: "Persistent storage for application data",
      min: 0,
      max: 20,
      warningMin: 3,
      warningMax: 7
    },
    {
      key: "dataTransfer" as const,
      label: "Data Transfer",
      sublabel: "Network Out",
      tooltip: "Bandwidth costs for API calls & media",
      min: 0,
      max: 20,
      warningMin: 1,
      warningMax: 10
    },
    {
      key: "telnyx" as const,
      label: "Telnyx Voice",
      sublabel: "SIP Trunking",
      tooltip: "Telephony infrastructure usage",
      min: 0,
      max: 150,
      warningMin: 20,
      warningMax: 80
    },
    {
      key: "retell" as const,
      label: "Retell AI Base",
      sublabel: "Voice AI Platform",
      tooltip: "Base subscription + transcription",
      min: 0,
      max: 150,
      warningMin: 40,
      warningMax: 100
    },
    {
      key: "amplify" as const,
      label: "AWS Amplify",
      sublabel: "Frontend Hosting (Shared)",
      tooltip: "Shared across all clients",
      isShared: true,
      min: 0,
      max: 50,
      warningMin: 5,
      warningMax: 20
    },
    {
      key: "workspacePerUser" as const,
      label: "Google Workspace",
      sublabel: "Per User (Shared)",
      tooltip: "Email & productivity tools",
      isShared: true,
      min: 0,
      max: 20,
      warningMin: 5,
      warningMax: 10
    },
  ]

  const totalShared = costs.amplify + costs.workspacePerUser * costs.workspaceUsers
  const sharedPerClient = totalShared / Math.max(1, clientCount)

  return (
    <div className="card-shell p-1">
      <div className="card-core p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white/90">Infrastructure Cost Defaults</h3>
            <p className="text-xs text-white/40 mt-0.5">
              Monthly variable & fixed infrastructure costs (USD)
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Shared: ${sharedPerClient.toFixed(2)}/client</span>
          </div>
        </div>

        {/* Cost Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {costFields.map((field) => {
            const value = costs[field.key]
            const isWarning = field.warningMin !== undefined && field.warningMax !== undefined &&
                            (value < field.warningMin || value > field.warningMax)
            const isError = field.min !== undefined && value < field.min ||
                          field.max !== undefined && value > field.max

            return (
              <div key={field.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-white/60 font-medium">
                    {field.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <span title={field.tooltip} className="text-white/30 hover:text-white/60 transition-colors cursor-help">
                      <HelpCircle size={12} />
                    </span>
                    {isError && (
                      <AlertTriangle size={14} className="text-red-400 animate-pulse" />
                    )}
                    {isWarning && !isError && (
                      <AlertTriangle size={14} className="text-amber-400 animate-pulse" />
                    )}
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">$</span>
                  <input
                    type="number"
                    step="0.5"
                    min={field.min}
                    max={field.max}
                    className={`
                      input-premium pl-7 pr-3 py-2 text-sm text-right font-mono
                      ${isError ? 'border-red-400 bg-red-900/20' : ''}
                      ${isWarning && !isError ? 'border-amber-400 bg-amber-900/20' : ''}
                    `}
                    value={value}
                    onChange={(e) => {
                      const numValue = Number(e.target.value) || 0
                      patchCosts({ [field.key]: numValue })
                    }}
                    onBlur={(e) => {
                      const numValue = Number(e.target.value) || 0
                      // Clamp value to min/max on blur
                      let clampedValue = numValue
                      if (field.min !== undefined && clampedValue < field.min) clampedValue = field.min
                      if (field.max !== undefined && clampedValue > field.max) clampedValue = field.max
                      if (clampedValue !== numValue) {
                        patchCosts({ [field.key]: clampedValue })
                      }
                    }}
                  />
                </div>
                <div className="text-[10px] text-white/30 truncate">{field.sublabel}</div>
                {isError && (
                  <div className="text-xs text-red-400 mt-1">
                    Value must be between {field.min} and {field.max}
                  </div>
                )}
                {isWarning && !isError && (
                  <div className="text-xs text-amber-400 mt-1">
                    Consider values between {field.warningMin}-{field.warningMax} for optimal performance
                  </div>
                )}
              </div>
            )
          })}

          {/* Workspace Users Counter */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/60 font-medium">
              Workspace Users
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                className="input-premium py-2 text-sm text-right font-mono w-20"
                value={costs.workspaceUsers}
                onChange={(e) =>
                  patchCosts({ workspaceUsers: Math.max(1, Number(e.target.value) || 1) })
                }
              />
              <span className="text-xs text-white/30">Active team members</span>
            </div>
          </div>
        </div>

        {/* One-time Legal Cost & Shared Allocation Note */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-3">
            <label className="text-xs text-white/60 whitespace-nowrap">
              Legal Review (One-time):
            </label>
            <div className="relative w-28">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">$</span>
              <input
                type="number"
                className="input-premium pl-7 pr-3 py-1.5 text-xs text-right font-mono"
                value={costs.legalOneTime}
                onChange={(e) =>
                  patchCosts({ legalOneTime: Number(e.target.value) || 0 })
                }
              />
            </div>
            <span className="text-[10px] text-white/30">(Excluded from monthly OPEX)</span>
          </div>

          <div className="text-xs text-white/40 font-mono">
            Total Shared Pool: ${totalShared.toFixed(2)} ÷ {Math.max(1, clientCount)} client(s)
          </div>
        </div>
      </div>
    </div>
  )
}