"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import GoalCard from "@/components/goals/GoalCard"
import AddGoalModal from "@/components/modals/AddGoalModal"
import { motion, AnimatePresence } from "framer-motion"
import { getCurrencySymbol } from "@/lib/utils"
import { Plus, Search, SlidersHorizontal } from "lucide-react"
import type { GoalCategory, Priority } from "@/types"

const categories: { label: string; icon: string }[] = [
  { label: "All", icon: "📋" },
  { label: "Apple Ecosystem", icon: "📱" },
  { label: "Vehicles", icon: "🏍" },
  { label: "Real Estate", icon: "🏠" },
  { label: "Travel", icon: "✈" },
  { label: "Gifts", icon: "🎁" },
  { label: "Business", icon: "💼" },
  { label: "Technology", icon: "💻" },
  { label: "Personal Goals", icon: "🎯" },
  { label: "Investments", icon: "💰" },
]

export default function GoalsPage() {
  const { state, dispatch } = useApp()
  const { goals, settings } = state.data
  const symbol = getCurrencySymbol(settings.currency, settings.customCurrencySymbol)
  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("All")
  const [filterPurchased, setFilterPurchased] = useState<"all" | "purchased" | "not-purchased">("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price-high" | "price-low" | "progress">("newest")

  const filteredGoals = useMemo(() => {
    let result = [...goals]

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(g => g.name.toLowerCase().includes(q) || g.notes.toLowerCase().includes(q) || g.category.toLowerCase().includes(q))
    }

    // Category filter
    if (filterCategory !== "All") {
      result = result.filter(g => g.category === filterCategory)
    }

    // Purchase filter
    if (filterPurchased === "purchased") result = result.filter(g => g.purchased)
    else if (filterPurchased === "not-purchased") result = result.filter(g => !g.purchased)

    // Sort
    switch (sortBy) {
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break
      case "oldest": result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break
      case "price-high": result.sort((a, b) => b.targetPrice - a.targetPrice); break
      case "price-low": result.sort((a, b) => a.targetPrice - b.targetPrice); break
      case "progress": result.sort((a, b) => (b.amountSaved / b.targetPrice) - (a.amountSaved / a.targetPrice)); break
    }

    return result
  }, [goals, search, filterCategory, filterPurchased, sortBy])

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Goals</h1>
                <p className="text-sm text-white/40 mt-1">{goals.filter(g => !g.purchased).length} active · {goals.filter(g => g.purchased).length} completed</p>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search goals..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input-premium pl-9"
                />
              </div>
              <select
                value={filterPurchased}
                onChange={e => setFilterPurchased(e.target.value as any)}
                className="select-premium"
              >
                <option value="all">All</option>
                <option value="purchased">Purchased</option>
                <option value="not-purchased">Not Purchased</option>
              </select>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="select-premium"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-high">Price: High</option>
                <option value="price-low">Price: Low</option>
                <option value="progress">Progress</option>
              </select>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat.label}
                  onClick={() => setFilterCategory(cat.label)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    filterCategory === cat.label
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30"
                      : "bg-white/[0.03] text-white/50 hover:text-white/70 border border-transparent"
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Goals Grid */}
            {filteredGoals.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-white/60 font-medium">No goals found</h3>
                <p className="text-white/30 text-sm mt-1">Add your first goal to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredGoals.map((goal, i) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <GoalCard goal={goal} symbol={symbol} dispatch={dispatch} locked={settings.locked} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all z-30 flex items-center justify-center"
      >
        <Plus size="24" />
      </button>

      {showAddModal && (
        <AddGoalModal
          onClose={() => setShowAddModal(false)}
          dispatch={dispatch}
        />
      )}
    </div>
  )
}
