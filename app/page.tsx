"use client"

import { useApp } from "@/store/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import DashboardView from "@/components/dashboard/DashboardView"
import { motion } from "framer-motion"

export default function Home() {
  const { state } = useApp()

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DashboardView />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
