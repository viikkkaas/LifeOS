"use client"

import { motion } from "framer-motion"
import Sidebar from "@/components/layout/Sidebar"
import { ProjectsBoard } from "@/components/command/ProjectsBoard"

export default function CommandPage() {
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
            <ProjectsBoard />
          </motion.div>
        </div>
      </main>
    </div>
  )
}