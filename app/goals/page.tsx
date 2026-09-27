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
    <div className="min-h-screen bg-black font-sans">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Tabs navClass="grid gap-2 bg-white/[0.03] border-b border-white/[0.05]">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id
                return (
                  <TabButton key={tab.id} active={isActive} onClick={() => setTab(tab.id)}>
                    <TabIcon size={16}>{tab.icon}</TabIcon>
                    {tab.label}
                  </TabButton>
                )
              })}
            </Tabs>

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
    <Suspense fallback={<div className="min-h-screen bg-black font-sans" />}>
      <GoalsPageContent />
    </Suspense>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

interface TabIconProps {
  size?: number
  children: React.ReactNode
}

interface TabsProps {
  navClass?: string
  children: React.ReactNode
}

function Tabs({ navClass = "grid gap-2 mb-12", children }: TabsProps) {
  return <nav className={navClass}>{children}</nav>
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg px-4 py-3 text-xs font-medium transition-all",
        active
          ? "text-white bg-indigo-600/15 border-b border-indigo-500/30 group-hover:text-indigo-400 group-hover:border-indigo-500/50"
          : "text-white/60 hover:text-indigo-400 hover:bg-indigo-600/10 transition-colors"
      )}
    >
      {children}
    </button>
  )
}

function TabIcon({ size = 20, children }: TabIconProps) {
  return (
    <span className={`text-indigo-400 mb-1 transition-transform group-hover:text-indigo-200 group-hover:scale-110 transition-transform ${size >= 16 ? "text-lg" : "text-md"}`}>{children}</span>
  )
}