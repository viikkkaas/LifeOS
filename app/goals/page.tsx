"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import Sidebar from "@/components/layout/Sidebar"
import GoalsListView from "@/components/goals/views/GoalsListView"
import DreamWallView from "@/components/goals/views/DreamWallView"
import VisionBoardView from "@/components/goals/views/VisionBoardView"
import SimulatorView from "@/components/goals/views/SimulatorView"
import { motion } from "framer-motion"
import { List, Columns, Layout, Calculator } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "list", label: "List", icon: List },
  { id: "wall", label: "Dream Wall", icon: Columns },
  { id: "board", label: "Vision Board", icon: Layout },
  { id: "simulator", label: "Simulator", icon: Calculator },
]

function GoalsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get("tab") || "list"

  const setTab = (tab: string) => {
    router.replace(`/goals?tab=${tab}`, { scroll: false })
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex gap-1 mb-8 p-1 rounded-xl bg-white/[0.03] border border-white/[0.04] w-fit">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 text-white border border-white/[0.06] shadow-sm"
                        : "text-white/40 hover:text-white/70"
                    )}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {activeTab === "list" && <GoalsListView />}
            {activeTab === "wall" && <DreamWallView />}
            {activeTab === "board" && <VisionBoardView />}
            {activeTab === "simulator" && <SimulatorView />}
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default function GoalsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <GoalsPageContent />
    </Suspense>
  )
}
