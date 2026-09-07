"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Target, BarChart3, Settings, Calendar, Clock,
  BookOpen, CheckSquare, Trophy, TrendingUp, Wallet,
  Menu, X, ChevronDown, Briefcase, Phone, Users, CalendarCheck,
  CalendarDays, ScrollText, Dumbbell, AlarmClock, Timer, PersonStanding,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: any
  exact?: boolean
}

interface NavGroup {
  label: string
  icon: any
  items: NavItem[]
}

const groups: NavGroup[] = [
  {
    label: "Sales",
    icon: Phone,
    items: [
      { href: "/sales/daily", label: "Daily Log", icon: Phone },
      { href: "/sales/weekly", label: "Weekly Review", icon: CalendarCheck },
      { href: "/sales/clients", label: "Clients", icon: Users },
      { href: "/sales/monthly", label: "Monthly Checkpoints", icon: CalendarDays },
      { href: "/sales/playbook", label: "Playbook", icon: ScrollText },
    ],
  },
  {
    label: "Money",
    icon: Wallet,
    items: [
      { href: "/net-worth", label: "Net Worth", icon: Wallet },
      { href: "/investments", label: "Investments", icon: TrendingUp },
      { href: "/business", label: "Business", icon: Briefcase },
      { href: "/business/cra", label: "Cra Receptionist AI", icon: Phone },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Goals",
    icon: Target,
    items: [
      { href: "/goals", label: "Goals Hub", icon: Target },
    ],
  },
  {
    label: "Challenges",
    icon: Dumbbell,
    items: [
      { href: "/75-hard", label: "75 Hard", icon: AlarmClock },
      { href: "/75-hard-2", label: "75 Hard 2", icon: Timer },
      { href: "/six-month-tracker", label: "Six-Month", icon: CalendarDays },
    ],
  },
  {
    label: "Life",
    icon: CheckSquare,
    items: [
      { href: "/habits", label: "Habits", icon: CheckSquare },
      { href: "/posture", label: "Posture", icon: PersonStanding },
      { href: "/journal", label: "Journal", icon: BookOpen },
      { href: "/timeline", label: "Timeline", icon: Clock },
      { href: "/calendar", label: "Calendar", icon: Calendar },
      { href: "/achievements", label: "Achievements", icon: Trophy },
    ],
  },
]

const standaloneItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/settings", label: "Settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Sales: true,
    Money: true,
    Goals: true,
    Challenges: true,
    Life: true,
  })

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href
    if (item.href === "/goals") {
      return pathname === "/goals" || pathname === "/dream-wall" || pathname === "/vision-board" || pathname === "/simulator"
    }
    return pathname.startsWith(item.href)
  }

  const isGroupActive = (group: NavGroup) => {
    return group.items.some(item => isActive(item))
  }

  const navLink = (item: NavItem, onClick?: () => void) => {
    const active = isActive(item)
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          active
            ? "bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 text-white border border-white/[0.06]"
            : "text-white/50 hover:text-white/80 hover:bg-white/[0.02]"
        )}
      >
        <item.icon size={18} className={active ? "text-[#667eea]" : "shrink-0"} />
        {item.label}
      </Link>
    )
  }

  const handleNav = () => setMobileOpen(false)

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
          <Link href="/" className="flex items-center gap-2.5" onClick={handleNav}>
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

        <nav className="p-3 space-y-1">
          {standaloneItems.map(item => navLink(item, handleNav))}

          {groups.map(group => {
            const groupActive = isGroupActive(group)
            const expanded = expandedGroups[group.label]
            return (
              <div key={group.label} className="pt-2">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors",
                    groupActive ? "text-white/60" : "text-white/30 hover:text-white/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <group.icon size={14} />
                    <span>{group.label}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={14} />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-2 pt-0.5 space-y-0.5">
                        {group.items.map(item => navLink(item, handleNav))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/[0.04] mt-2">
          <div className="text-xs text-white/30 text-center">
            Track your goals, money, and life in one place.
          </div>
        </div>
      </aside>
    </>
  )
}
