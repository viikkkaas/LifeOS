"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react"
import type {
  AppData, Goal, Habit, JournalEntry,
  BusinessMetrics, Investment, NetWorth, Settings,
  Achievement, Deposit, Stats, DailyGoal
} from "@/types"
import { DEFAULT_APP_DATA } from "@/lib/defaults"
import { calculateProgress, generateId, getToday, getCurrencySymbol } from "@/lib/utils"
import confetti from "canvas-confetti"

interface AppState {
  data: AppData
  stats: Stats
  initialized: boolean
}

type Action =
  | { type: "INIT"; payload: AppData }
  | { type: "ADD_GOAL"; payload: Goal }
  | { type: "UPDATE_GOAL"; payload: Goal }
  | { type: "DELETE_GOAL"; payload: string }
  | { type: "DUPLICATE_GOAL"; payload: Goal }
  | { type: "MARK_PURCHASED"; payload: { id: string; date: string } }
  | { type: "TOGGLE_LOCK_GOAL"; payload: string }
  | { type: "ADD_DEPOSIT"; payload: { goalId: string; deposit: Deposit } }
  | { type: "REORDER_GOALS"; payload: Goal[] }
  | { type: "ADD_HABIT_LOG"; payload: { habitId: string; date: string; completed: boolean } }
  | { type: "ADD_JOURNAL"; payload: JournalEntry }
  | { type: "UPDATE_JOURNAL"; payload: JournalEntry }
  | { type: "DELETE_JOURNAL"; payload: string }
  | { type: "UPDATE_BUSINESS"; payload: Partial<BusinessMetrics> }
  | { type: "ADD_INVESTMENT"; payload: Investment }
  | { type: "UPDATE_INVESTMENT"; payload: Investment }
  | { type: "DELETE_INVESTMENT"; payload: string }
  | { type: "UPDATE_NET_WORTH"; payload: Partial<NetWorth> }
  | { type: "UPDATE_SETTINGS"; payload: Partial<Settings> }
  | { type: "UNLOCK_ACHIEVEMENT"; payload: Achievement }
  | { type: "SET_LOCKED"; payload: boolean }
  | { type: "ADD_DAILY_GOAL"; payload: DailyGoal }
  | { type: "UPDATE_DAILY_GOAL"; payload: DailyGoal }
  | { type: "DELETE_DAILY_GOAL"; payload: string }
  | { type: "RECALCULATE" }

function calculateStats(data: AppData): Stats {
  const goals = data.goals
  const totalGoals = goals.length
  const purchasedGoals = goals.filter(g => g.purchased).length
  const pendingGoals = totalGoals - purchasedGoals
  const totalDreamCost = goals.reduce((sum, g) => sum + g.targetPrice, 0)
  const totalSaved = goals.reduce((sum, g) => sum + g.amountSaved, 0)
  const remainingAmount = totalDreamCost - totalSaved
  const monthlyIncome = data.settings.monthlyIncome
  const monthlySavings = monthlyIncome * (data.settings.savingsRate / 100)
  const averageGoalPrice = totalGoals > 0 ? Math.round(totalDreamCost / totalGoals) : 0
  const mostExpensive = goals.length > 0 ? goals.reduce((a, b) => a.targetPrice > b.targetPrice ? a : b) : null
  const cheapest = goals.length > 0 ? goals.filter(g => !g.purchased).reduce((a, b) => a.targetPrice < b.targetPrice ? a : b) : null
  const avgGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + (g.targetPrice > 0 ? (g.amountSaved / g.targetPrice) * 100 : 0), 0) / goals.length)
    : 0
  const overallCompletion = avgGoalProgress
  const currentNetWorth = calculateNetWorthValue(data.netWorth)

  const nonPurchased = goals.filter(g => !g.purchased)
  const closest = nonPurchased.length > 0
    ? nonPurchased.reduce((a, b) => (a.amountSaved / a.targetPrice) > (b.amountSaved / b.targetPrice) ? a : b)
    : null
  const recentlyPurchased = goals.filter(g => g.purchased && g.purchaseDate)
    .sort((a, b) => new Date(b.purchaseDate!).getTime() - new Date(a.purchaseDate!).getTime())[0] || null
  const upcomingGoal = nonPurchased.sort((a, b) => a.targetYear - b.targetYear)[0] || null

  // Projected completion date based on savings rate
  let projectedDate = "N/A"
  if (monthlySavings > 0 && remainingAmount > 0) {
    const monthsNeeded = Math.ceil(remainingAmount / monthlySavings)
    const projected = new Date()
    projected.setMonth(projected.getMonth() + monthsNeeded)
    projectedDate = projected.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  // Life score calculation
  const goalCompletionRate = totalGoals > 0 ? (purchasedGoals / totalGoals) * 100 : 0
  const netWorthGrowth = currentNetWorth > 0 ? 50 : 0 // baseline
  const savingsConsistency = monthlySavings > 0 ? Math.min(monthlySavings / (monthlyIncome * 0.5) * 100, 100) : 0
  const habitStreaks = data.habits.length > 0
    ? (data.habits.filter(h => h.streak >= 3).length / data.habits.length) * 100
    : 0
  const businessGrowth = data.business.revenue > 0 ? 50 : 0

  const lifeScore = Math.round(
    netWorthGrowth * 0.25 +
    goalCompletionRate * 0.25 +
    savingsConsistency * 0.2 +
    habitStreaks * 0.15 +
    businessGrowth * 0.15
  )

  return {
    totalGoals, purchasedGoals, pendingGoals, totalDreamCost,
    currentNetWorth, totalSaved, remainingAmount, monthlyIncome,
    monthlySavings, averageGoalPrice, mostExpensiveGoal: mostExpensive,
    cheapestGoal: cheapest, averageSavingsRate: data.settings.savingsRate,
    projectedCompletionDate: projectedDate,
    overallCompletionPercentage: overallCompletion,
    closestGoal: closest, recentlyPurchased, upcomingGoal,
    lifeScore,
    lifeScoreComponents: {
      netWorthGrowth,
      goalCompletionRate,
      savingsConsistency,
      habitStreaks,
      businessGrowth,
    },
  }
}

function calculateNetWorthValue(netWorth: NetWorth): number {
  const assets = netWorth.cash + netWorth.investments + netWorth.stocks +
    netWorth.mutualFunds + netWorth.businessValue + netWorth.gold +
    netWorth.crypto + netWorth.vehicles + netWorth.realEstate
  const liabilities = netWorth.loans + netWorth.creditCard + netWorth.mortgage
  return assets - liabilities
}

function appReducer(state: AppState, action: Action): AppState {
  let newData: AppData

  switch (action.type) {
    case "INIT": {
      // Merge stored data with defaults so new fields missing from old localStorage don't crash
      const merged: AppData = { ...DEFAULT_APP_DATA, ...action.payload }
      return { data: merged, stats: calculateStats(merged), initialized: true }
    }

    case "ADD_GOAL": {
      newData = { ...state.data, goals: [...state.data.goals, action.payload] }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "UPDATE_GOAL": {
      newData = {
        ...state.data,
        goals: state.data.goals.map(g => g.id === action.payload.id ? action.payload : g)
      }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "DELETE_GOAL": {
      newData = { ...state.data, goals: state.data.goals.filter(g => g.id !== action.payload) }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "DUPLICATE_GOAL": {
      const newGoal = { ...action.payload, id: generateId(), name: `${action.payload.name} (Copy)`, createdAt: new Date().toISOString() }
      newData = { ...state.data, goals: [...state.data.goals, newGoal] }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "MARK_PURCHASED": {
      newData = {
        ...state.data,
        goals: state.data.goals.map(g =>
          g.id === action.payload.id
            ? { ...g, purchased: true, purchaseDate: action.payload.date }
            : g
        )
      }
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe"],
        })
      }, 100)
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "TOGGLE_LOCK_GOAL": {
      newData = {
        ...state.data,
        goals: state.data.goals.map(g =>
          g.id === action.payload ? { ...g, locked: !g.locked } : g
        )
      }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "ADD_DEPOSIT": {
      newData = {
        ...state.data,
        goals: state.data.goals.map(g => {
          if (g.id !== action.payload.goalId) return g
          const newSaved = g.amountSaved + action.payload.deposit.amount
          return {
            ...g,
            amountSaved: newSaved,
            deposits: [...g.deposits, action.payload.deposit],
          }
        })
      }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "REORDER_GOALS": {
      newData = { ...state.data, goals: action.payload }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "ADD_HABIT_LOG": {
      newData = {
        ...state.data,
        habits: state.data.habits.map(h => {
          if (h.id !== action.payload.habitId) return h
          const existing = h.logs.find(l => l.date === action.payload.date)
          let newLogs = existing
            ? h.logs.map(l => l.date === action.payload.date ? { ...l, completed: action.payload.completed } : l)
            : [...h.logs, { date: action.payload.date, completed: action.payload.completed }]

          let streak = 0
          const today = new Date()
          for (let i = 0; i < 365; i++) {
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split("T")[0]
            const log = newLogs.find(l => l.date === dateStr)
            if (log && log.completed) {
              streak++
            } else if (dateStr !== getToday()) {
              break
            }
          }

          return { ...h, logs: newLogs, streak, lastCheckin: action.payload.completed ? getToday() : h.lastCheckin }
        })
      }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "ADD_JOURNAL": {
      newData = { ...state.data, journal: [action.payload, ...state.data.journal] }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "UPDATE_JOURNAL": {
      newData = {
        ...state.data,
        journal: state.data.journal.map(j => j.id === action.payload.id ? action.payload : j)
      }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "DELETE_JOURNAL": {
      newData = { ...state.data, journal: state.data.journal.filter(j => j.id !== action.payload) }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "UPDATE_BUSINESS": {
      newData = { ...state.data, business: { ...state.data.business, ...action.payload } }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "ADD_INVESTMENT": {
      newData = { ...state.data, investments: [...state.data.investments, action.payload] }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "UPDATE_INVESTMENT": {
      newData = {
        ...state.data,
        investments: state.data.investments.map(i => i.id === action.payload.id ? action.payload : i)
      }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "DELETE_INVESTMENT": {
      newData = { ...state.data, investments: state.data.investments.filter(i => i.id !== action.payload) }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "UPDATE_NET_WORTH": {
      newData = { ...state.data, netWorth: { ...state.data.netWorth, ...action.payload } }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "UPDATE_SETTINGS": {
      newData = {
        ...state.data,
        settings: { ...state.data.settings, ...action.payload }
      }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "UNLOCK_ACHIEVEMENT": {
      newData = {
        ...state.data,
        achievements: [...state.data.achievements, action.payload]
      }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "SET_LOCKED": {
      newData = { ...state.data, settings: { ...state.data.settings, locked: action.payload } }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "ADD_DAILY_GOAL": {
      newData = { ...state.data, dailyGoals: [...state.data.dailyGoals, action.payload] }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "UPDATE_DAILY_GOAL": {
      newData = {
        ...state.data,
        dailyGoals: state.data.dailyGoals.map(dg => dg.id === action.payload.id ? action.payload : dg)
      }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "DELETE_DAILY_GOAL": {
      newData = { ...state.data, dailyGoals: state.data.dailyGoals.filter(dg => dg.id !== action.payload) }
      return { data: newData, stats: calculateStats(newData), initialized: true }
    }

    case "RECALCULATE":
      return { ...state, stats: calculateStats(state.data) }

    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    data: DEFAULT_APP_DATA,
    stats: calculateStats(DEFAULT_APP_DATA),
    initialized: false,
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lifeos_data")
      if (saved) {
        const parsed = JSON.parse(saved) as AppData
        dispatch({ type: "INIT", payload: parsed })
      } else {
        dispatch({ type: "INIT", payload: DEFAULT_APP_DATA })
      }
    } catch {
      dispatch({ type: "INIT", payload: DEFAULT_APP_DATA })
    }
  }, [])

  useEffect(() => {
    if (state.initialized) {
      localStorage.setItem("lifeos_data", JSON.stringify(state.data))
    }
  }, [state.data, state.initialized])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within AppProvider")
  return context
}
