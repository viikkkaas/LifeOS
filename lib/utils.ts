import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, symbol: string = "₹"): string {
  return `${symbol}${amount.toLocaleString("en-IN")}`
}

export function formatCompactCurrency(amount: number, symbol: string = "₹"): string {
  if (amount >= 10000000) {
    return `${symbol}${(amount / 10000000).toFixed(1)}Cr`
  }
  if (amount >= 100000) {
    return `${symbol}${(amount / 100000).toFixed(1)}L`
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`
  }
  return `${symbol}${amount}`
}

export function calculateProgress(saved: number, target: number): number {
  if (target === 0) return 0
  return Math.min(Math.round((saved / target) * 100), 100)
}

export function calculateNetWorth(assets: Record<string, number>, liabilities: Record<string, number>): number {
  const totalAssets = Object.values(assets).reduce((a, b) => a + b, 0)
  const totalLiabilities = Object.values(liabilities).reduce((a, b) => a + b, 0)
  return totalAssets - totalLiabilities
}

export function getCurrencySymbol(currency: string, customSymbol: string = ""): string {
  if (customSymbol) return customSymbol
  switch (currency) {
    case "INR": return "₹"
    case "USD": return "$"
    case "AED": return "د.إ"
    case "GBP": return "£"
    case "EUR": return "€"
    default: return "₹"
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function getToday(): string {
  return new Date().toISOString().split("T")[0]
}

export function getCurrentAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function getDaysAlive(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  return Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
}

export function getMotivationalQuote(goals: any[], monthlyIncome: number): string {
  const quotes = [
    `"If you save ₹${(monthlyIncome * 0.3).toLocaleString()} this month, you'll be closer to your dreams."`,
    `"The best time to start was yesterday. The next best time is now."`,
    `"Small daily savings lead to extraordinary results."`,
    `"Your future is created by what you do today, not tomorrow."`,
    `"Every ₹ saved is a step closer to freedom."`,
  ]
  return quotes[Math.floor(Math.random() * quotes.length)]
}

export function getLifeScore(stats: {
  netWorthGrowth: number
  goalCompletion: number
  savingsConsistency: number
  habitStreaks: number
  businessGrowth: number
}): number {
  const { netWorthGrowth, goalCompletion, savingsConsistency, habitStreaks, businessGrowth } = stats
  const score = (
    netWorthGrowth * 0.25 +
    goalCompletion * 0.25 +
    savingsConsistency * 0.2 +
    habitStreaks * 0.15 +
    businessGrowth * 0.15
  )
  return Math.min(Math.round(score), 100)
}
