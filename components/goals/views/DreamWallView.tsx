"use client"

import { useApp } from "@/store/AppContext"
import { motion } from "framer-motion"
import { getCurrencySymbol, formatCompactCurrency, calculateProgress } from "@/lib/utils"
import { useState } from "react"
import { X } from "lucide-react"

export default function DreamWallView() {
  const { state } = useApp()
  const { goals, settings } = state.data
  const symbol = getCurrencySymbol(settings.currency, settings.customCurrencySymbol)
  const [selected, setSelected] = useState<string | null>(null)

  const sorted = [...goals].sort((a, b) => b.targetPrice - a.targetPrice)
  const activeGoal = selected ? sorted.find(g => g.id === selected) : null

  const gradientPairs = [
    "from-indigo-500/5 to-purple-500/5",
    "from-emerald-500/5 to-teal-500/5",
    "from-amber-500/5 to-orange-500/5",
    "from-rose-500/5 to-pink-500/5",
    "from-cyan-500/5 to-blue-500/5",
    "from-violet-500/5 to-fuchsia-500/5",
  ]

  return (
    <div className="font-sans bg-black min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-4 font-mono">Dream Wall</h1>
      <p className="text-white/40 text-sm mb-10 font-mono">Everything you want in life. Visualized.</p>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-8">
        {sorted.map((goal, i) => {
          const progress = calculateProgress(goal.amountSaved, goal.targetPrice)
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`card-shell p-1 group cursor-pointer transition-all duration-300 hover:scale-[1.02] ${goal.purchased ? 'ring ring-opacity-5' : ''}`}
              onClick={() => setSelected(goal.id)}
            >
              <div className="card-core h-48 bg-gradient-to-br gradient-pair rounded-xl flex items-center justify-center relative overflow-hidden">
                {goal.imageUrl ? (
                  <img src={goal.imageUrl} alt={goal.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl opacity-30 font-mono">
                    {goal.category === "Apple Ecosystem" ? "📱" :
                     goal.category === "Vehicles" ? "🏍" :
                     goal.category === "Real Estate" ? "🏠" :
                     goal.category === "Travel" ? "✈" :
                     goal.category === "Gifts" ? "🎁" :
                     goal.category === "Business" ? "💼" :
                     goal.category === "Technology" ? "💻" :
                     goal.category === "Personal Goals" ? "🎯" : "💰"}
                  </span>
                )}
                {goal.purchased && (
                  <div className="absolute top-3 right-3 text-indigo-400 text-[10px] px-2 py-1 rounded-full font-medium font-mono">
                    ✓ Purchased
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-white/5 p-2 rounded-full text-xs text-indigo-400/60 font-mono">
                  #{sorted.indexOf(goal) + 1} of {sorted.length}
                </div>
              </div>
              <div className="card-core p-5">
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-2">{goal.category}</div>
                <h3 className="font-semibold text-white text-base mb-2 line-clamp-2">{goal.name}</h3>
                <div className="flex items-center justify-between text-sm text-white/50 mb-2">
                  <span className="font-medium font-mono">{formatCompactCurrency(goal.targetPrice, symbol)}</span>
                  <span className="text-white/50 font-mono text-xs track-widest">{progress}%</span>
                </div>
                <div className="progress-bar h-1.5 rounded-full mt-3">
                  <div
                    className="progress-bar-fill rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {activeGoal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="card-shell p-6 card-core max-w-lg w-full rounded-xl border border-white/[0.05]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white font-mono">{activeGoal.name}</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded hover:bg-white/5 text-white/40 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 text-sm text-white/50 font-mono">
              <div className="flex justify-between">
                <span>Category</span><span className="text-white/80">{activeGoal.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Price</span><span className="text-emerald-400 font-medium">{formatCompactCurrency(activeGoal.targetPrice, symbol)}</span>
              </div>
              <div className="flex justify-between">
                <span>Saved</span><span className="text-emerald-400">{formatCompactCurrency(activeGoal.amountSaved, symbol)}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining</span><span className="text-amber-400">{formatCompactCurrency(activeGoal.targetPrice - activeGoal.amountSaved, symbol)}</span>
              </div>
              <div className="flex justify-between">
                <span>Priority</span><span className="text-white/80">{activeGoal.priority}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Year</span><span className="text-white/80">{activeGoal.targetYear}</span>
              </div>
              {activeGoal.purchased && activeGoal.purchaseDate && (
                <div className="flex justify-between">
                  <span>Purchased</span><span className="text-emerald-400">{new Date(activeGoal.purchaseDate).toLocaleDateString()}</span>
                </div>
              )}
              {activeGoal.why && (
                <div className="pt-4 border-t border-white/[0.04]">
                  <div className="text-xs text-white/30 mb-1">Why this matters</div>
                  <p className="text-white/60">{activeGoal.why}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}