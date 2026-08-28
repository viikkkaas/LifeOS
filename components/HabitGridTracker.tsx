"use client"

import { useEffect, useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { CalendarDays, Check } from "lucide-react"

interface HabitGridTrackerProps {
  rows: string[]
  totalDays: number
  blockSize?: number
  storageKey: string
}

interface GridState {
  startDate: string | null
  checks: Record<string, Record<number, boolean>>
}

export function emptyState(): GridState {
  return { startDate: null, checks: {} }
}

export default function HabitGridTracker({
  rows,
  totalDays,
  blockSize = 25,
  storageKey,
}: HabitGridTrackerProps) {
  const [state, setState] = useState<GridState>(emptyState)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as GridState
        setState({
          startDate: parsed?.startDate ?? null,
          checks: parsed?.checks ?? {},
        })
      }
    } catch {}
    setLoaded(true)
  }, [storageKey])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(storageKey, JSON.stringify(state))
    }
  }, [state, loaded, storageKey])

  const blocks = useMemo(() => {
    const result: { start: number; end: number }[] = []
    for (let s = 1; s <= totalDays; s += blockSize) {
      result.push({ start: s, end: Math.min(s + blockSize - 1, totalDays) })
    }
    return result
  }, [totalDays, blockSize])

  const setStartDate = (date: string) => {
    setState(prev => ({ ...prev, startDate: date }))
  }

  const toggleDay = (row: string, day: number) => {
    setState(prev => {
      const rowChecks = prev.checks[row] ?? {}
      return {
        ...prev,
        checks: {
          ...prev.checks,
          [row]: { ...rowChecks, [day]: !rowChecks[day] },
        },
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4 card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-white/60">
            <CalendarDays size={16} className="text-[#667eea]" />
            <span className="text-sm font-medium">Start Date</span>
          </div>
          <input
            type="date"
            value={state.startDate ?? ""}
            onChange={e => setStartDate(e.target.value)}
            className="input-premium !w-auto"
          />
        </div>
        <div className="flex items-center gap-4">
          {rows.map(row => {
            const done = Object.values(state.checks[row] ?? {}).filter(Boolean).length
            return (
              <div key={row} className="text-right">
                <div className="text-xs text-white/40">{row}</div>
                <div className="text-sm font-semibold text-white">
                  {done}
                  <span className="text-white/30 font-normal">/{totalDays}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
        <div className="min-w-max p-2">
          <div className="flex items-center gap-x-1.5">
            <div className="w-[120px] shrink-0" />
            {blocks.map(block => (
              <div
                key={block.start}
                className="grid gap-x-1.5 grow-0"
                style={{
                  gridTemplateColumns: `repeat(${block.end - block.start + 1}, 24px)`,
                }}
              >
                {Array.from({ length: block.end - block.start + 1 }, (_, i) => (
                  <div key={block.start + i} className="text-center text-[11px] text-white/40 font-medium py-1">
                    {block.start + i}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {rows.map(row => (
            <div
              key={row}
              className="flex items-center gap-x-1.5 my-1.5"
            >
              <div className="w-[120px] shrink-0 text-sm text-white/80 font-medium pr-2 truncate">
                {row}
              </div>
              {blocks.map(block => (
                <div
                  key={block.start}
                  className="grid gap-x-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${block.end - block.start + 1}, 24px)`,
                  }}
                >
                  {Array.from({ length: block.end - block.start + 1 }, (_, i) => {
                    const day = block.start + i
                    const done = state.checks[row]?.[day] ?? false
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(row, day)}
                        aria-label={`${row} day ${day} ${done ? "done" : "not done"}`}
                        className={cn(
                          "h-6 w-6 rounded transition-all flex items-center justify-center",
                          done
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-white/5 border border-white/[0.04] hover:bg-white/10"
                        )}
                      >
                        {done ? <Check size={13} strokeWidth={3} /> : null}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
