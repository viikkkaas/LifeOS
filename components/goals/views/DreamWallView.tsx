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

  const gradients = [
    "from-blue-500/10 to-purple-500/10",
    "from-emerald-500/10 to-teal-500/10",
    "from-amber-500/10 to-orange-500/10",
    "from-rose-500/10 to-pink-500/10",
    "from-cyan-500/10 to-blue-500/10",
    "from-violet-500/10 to-fuchsia-500/10",
  ]

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-2">Dream Wall</h1>
      <p className="text-white/40 text-sm mb-8">Everything you want in life. Visualized.</p>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {sorted.map((goal, i) => {
          const progress = calculateProgress(goal.amountSaved, goal.targetPrice)
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`break-inside-avoid card overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                goal.purchased ? 'border-emerald-500/20' : ''
              }`}
              onClick={() => setSelected(goal.id)}
              layout
            >
              <div className={`h-40 bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center relative`}>
                {goal.imageUrl ? (
                  <img src={goal.imageUrl} alt={goal.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl opacity-30">
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
                  <div className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                    ✓ Purchased
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="text-xs text-white/30 mb-1">{goal.category}</div>
                <h3 className="font-semibold text-white text-base mb-2">{goal.name}</h3>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/80 font-medium">{formatCompactCurrency(goal.targetPrice, symbol)}</span>
                  <span className="text-white/40">{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-bar-fill ${goal.purchased ? 'green' : ''}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {activeGoal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-lg p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{activeGoal.name}</h2>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-white/5 text-white/40">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-sm text-white/60">
              <div className="flex justify-between"><span>Category</span><span className="text-white/80">{activeGoal.category}</span></div>
              <div className="flex justify-between"><span>Target Price</span><span className="text-white/80 font-medium">{formatCompactCurrency(activeGoal.targetPrice, symbol)}</span></div>
              <div className="flex justify-between"><span>Saved</span><span className="text-emerald-400">{formatCompactCurrency(activeGoal.amountSaved, symbol)}</span></div>
              <div className="flex justify-between"><span>Remaining</span><span className="text-amber-400">{formatCompactCurrency(activeGoal.targetPrice - activeGoal.amountSaved, symbol)}</span></div>
              <div className="flex justify-between"><span>Priority</span><span className="text-white/80">{activeGoal.priority}</span></div>
              <div className="flex justify-between"><span>Target Year</span><span className="text-white/80">{activeGoal.targetYear}</span></div>
              {activeGoal.purchased && activeGoal.purchaseDate && (
                <div className="flex justify-between"><span>Purchased</span><span className="text-emerald-400">{new Date(activeGoal.purchaseDate).toLocaleDateString()}</span></div>
              )}
              {activeGoal.why && (
                <div className="pt-2 border-t border-white/[0.04]">
                  <div className="text-xs text-white/30 mb-1">Why this matters</div>
                  <p className="text-white/60 italic">&ldquo;{activeGoal.why}&rdquo;</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
