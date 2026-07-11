"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Target, BarChart3, Settings, Calendar, Clock,
  BookOpen, CheckSquare, Briefcase, TrendingUp, Image as ImageIcon,
  Layout, Trophy, DollarSign, Wallet, Menu, X, Calculator,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/dream-wall", label: "Dream Wall", icon: ImageIcon },
  { href: "/vision-board", label: "Vision Board", icon: Layout },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/simulator", label: "Simulator", icon: Calculator },
  { href: "/net-worth", label: "Net Worth", icon: Wallet },
  { href: "/investments", label: "Investments", icon: TrendingUp },
  { href: "/business", label: "Business", icon: Briefcase },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg glass"
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64",
        "bg-[#0a0a0f] border-r border-white/[0.04]",
        "transform transition-transform duration-300 lg:translate-x-0",
        "overflow-y-auto overflow-x-hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-5 border-b border-white/[0.04]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">
              LifeOS
            </span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 rounded hover:bg-white/5">
            <X size={18} className="text-white/60" />
          </button>
        </div>

        <nav className="p-3 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 text-white border border-white/[0.06]"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.02]"
                )}
              >
                <item.icon size={18} className={active ? "text-[#667eea]" : ""} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.04]">
          <div className="text-xs text-white/30 text-center">
            LifeOS v1.0
          </div>
        </div>
      </aside>
    </>
  )
}
