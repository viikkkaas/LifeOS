"use client"

import Sidebar from "@/components/layout/Sidebar"
import HabitGridTracker from "@/components/HabitGridTracker"
import { motion } from "framer-motion"
import { Dumbbell, CheckCircle2, RotateCcw } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const RULES = [
  "No cheat meals, no alcohol",
  "1 gallon water/day",
  "2x45min workout, one outdoors",
  "Read 10 pages non-fiction",
  "Daily progress pic",
]

export default function Hard75Page2() {
  const reset = () => {
    if (confirm("Reset 75 Hard Attempt 2? This clears all progress for this attempt.")) {
      localStorage.removeItem("75hard-2")
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-white">75 Hard</h1>
                <p className="text-white/40 text-sm mt-1">Attempt 2 &bull; restart after a reset</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/75-hard"
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    "text-white/50 hover:text-white/80 hover:bg-white/[0.02]"
                  )}
                >
                  ← Attempt 1
                </Link>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <RotateCcw size={15} />
                  Reset
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden mb-6">
              <div className="px-4 py-3 bg-gradient-to-r from-[#667eea]/15 to-[#764ba2]/15 border border-white/[0.06] flex items-center gap-2">
                <Dumbbell size={16} className="text-[#667eea]" />
                <span className="text-sm font-semibold text-white">The 5 Rules</span>
              </div>
              <div className="bg-white/[0.01] border border-t-0 border-white/[0.06]">
                {RULES.map((rule, i) => (
                  <div
                    key={rule}
                    className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.04] last:border-b-0"
                  >
                    <CheckCircle2 size={15} className="text-emerald-400/80 shrink-0" />
                    <span className="text-sm text-white/70">
                      <span className="text-white/30 font-medium mr-2">{String(i + 1).padStart(2, "0")}</span>
                      {rule}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <HabitGridTracker
              rows={["Diet", "Water", "Book", "Workout", "Pic"]}
              totalDays={75}
              blockSize={25}
              storageKey="75hard-2"
            />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
