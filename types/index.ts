export type Currency = "INR" | "USD" | "AED" | "GBP" | "EUR"

export type Theme = "dark" | "light" | "oled"

export type GoalCategory =
  | "Apple Ecosystem"
  | "Vehicles"
  | "Real Estate"
  | "Travel"
  | "Gifts"
  | "Business"
  | "Technology"
  | "Personal Goals"
  | "Investments"

export type Priority = "Low" | "Medium" | "High" | "Critical"

export type GoalTag = "Need" | "Want" | "Luxury" | "Gift"

export interface Goal {
  id: string
  name: string
  category: GoalCategory
  targetPrice: number
  amountSaved: number
  priority: Priority
  targetYear: number
  purchased: boolean
  purchaseDate: string | null
  notes: string
  imageUrl: string
  tags: GoalTag[]
  why: string
  images: string[]
  recurringSaving: number
  recurringFrequency: "Monthly" | "Weekly" | "None"
  deposits: Deposit[]
  createdAt: string
  updatedAt: string
  order: number
  locked: boolean
}

export interface Deposit {
  id: string
  date: string
  amount: number
  note: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xp: number
  unlocked: boolean
  unlockedAt: string | null
  condition: (goals: Goal[], stats: Stats) => boolean
}

export interface Stats {
  totalGoals: number
  purchasedGoals: number
  pendingGoals: number
  totalDreamCost: number
  currentNetWorth: number
  totalSaved: number
  remainingAmount: number
  monthlyIncome: number
  monthlySavings: number
  averageGoalPrice: number
  mostExpensiveGoal: Goal | null
  cheapestGoal: Goal | null
  averageSavingsRate: number
  projectedCompletionDate: string
  overallCompletionPercentage: number
  closestGoal: Goal | null
  recentlyPurchased: Goal | null
  upcomingGoal: Goal | null
  lifeScore: number
  lifeScoreComponents: {
    netWorthGrowth: number
    goalCompletionRate: number
    savingsConsistency: number
    habitStreaks: number
    businessGrowth: number
  }
}

export interface Habit {
  id: string
  name: string
  icon: string
  streak: number
  lastCheckin: string | null
  logs: HabitLog[]
  createdAt: string
}

export interface HabitLog {
  date: string
  completed: boolean
}

export interface JournalEntry {
  id: string
  date: string
  title: string
  content: string
  wins: string
  losses: string
  ideas: string
  lessons: string
  createdAt: string
}

export interface BusinessMetrics {
  revenue: number
  mrr: number
  clients: number
  meetings: number
  coldCalls: number
  dealsClosed: number
  conversionRate: number
  monthlyData: BusinessMonthlyData[]
}

export interface BusinessMonthlyData {
  month: string
  revenue: number
  mrr: number
  clients: number
}

export interface Investment {
  id: string
  type: "Mutual Funds" | "Stocks" | "Crypto" | "Gold" | "Business"
  name: string
  amount: number
  returns: number
  allocation: number
}

export interface NetWorth {
  cash: number
  investments: number
  stocks: number
  mutualFunds: number
  businessValue: number
  gold: number
  crypto: number
  vehicles: number
  realEstate: number
  loans: number
  creditCard: number
  mortgage: number
}

export interface ObjectionTally {
  price: number
  timing: number
  trust: number
  alreadyHas: number
  other: number
}

export interface NoCloseReasonTally {
  price: number
  timing: number
  trust: number
  wantsToThink: number
  ghosted: number
  other: number
}

export interface DailyGoal {
  id: string
  date: string
  coldCalls: number
  conversations: number
  demos: number
  gatekeepersPassed: number
  shows: number
  objections: ObjectionTally
  closes: number
  noCloses: number
  noCloseReasons: NoCloseReasonTally
  scriptVersion: string
  notes: string
  createdAt: string
}

export interface WeeklyReview {
  id: string
  weekStart: string
  scriptChanges: string
  leadsRemaining: number
  bugsFixed: string
  bugsOpen: string
  hoursSales: number
  hoursTech: number
  hoursCollege: number
  notes: string
  createdAt: string
}

export type OnboardingStatus = "Pending" | "Delivered" | "Overdue"

export interface Client {
  id: string
  name: string
  clinic: string
  closeDate: string
  setupFee: number
  mrr: number
  onboardingStatus: OnboardingStatus
  caseStudyRights: boolean
  issues: string
  createdAt: string
}

export type CollegeStatus = "Passing" | "At Risk" | "Clear"

export interface MonthlyCheckpoint {
  id: string
  month: string
  mrrTotal: number
  churn: number
  collegeStatus: CollegeStatus
  notes: string
  createdAt: string
}

export interface ScriptVersion {
  version: string
  content: string
}

export type BugStatus = "Open" | "Fixed"

export interface BugItem {
  id: string
  title: string
  status: BugStatus
  date: string
  detail: string
}

export interface Playbook {
  scriptVersions: ScriptVersion[]
  objectionsDoc: string
  demoFlow: string
  n8nSummary: string
  bugs: BugItem[]
}

export interface Settings {
  currency: Currency
  customCurrencySymbol: string
  theme: Theme
  monthlyIncome: number
  savingsRate: number
  businessProfitMargin: number
  locked: boolean
}

export interface AppData {
  goals: Goal[]
  dailyGoals: DailyGoal[]
  weeklyReviews: WeeklyReview[]
  clients: Client[]
  monthlyCheckpoints: MonthlyCheckpoint[]
  playbook: Playbook
  habits: Habit[]
  journal: JournalEntry[]
  business: BusinessMetrics
  investments: Investment[]
  netWorth: NetWorth
  settings: Settings
  achievements: Achievement[]
}
