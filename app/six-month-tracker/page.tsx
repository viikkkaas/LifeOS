"use client"

import Sidebar from "@/components/layout/Sidebar"
import SixMonthTracker from "@/components/SixMonthTracker"
import { motion } from "framer-motion"

export default function SixMonthTrackerPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-white">Six-Month Tracker</h1>
              <p className="text-white/40 text-sm mt-1">180 days. Stats, streaks, notes, and stretch goals.</p>
            </div>

            <SixMonthTracker />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
