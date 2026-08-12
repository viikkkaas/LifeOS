import type { Goal, Habit, BusinessMetrics, Investment, NetWorth, Settings, AppData, DailyGoal, Playbook } from "@/types"

export const DEFAULT_GOALS: Goal[] = [
  { id: "g1", name: "iPhone Pro", category: "Apple Ecosystem", targetPrice: 150000, amountSaved: 45000, priority: "High", targetYear: 2025, purchased: false, purchaseDate: null, notes: "Latest iPhone Pro Max with 1TB storage", imageUrl: "", tags: ["Want"], why: "Need the best tools for content creation", images: [], recurringSaving: 5000, recurringFrequency: "Monthly", deposits: [], createdAt: "", updatedAt: "", order: 0, locked: false },
  { id: "g2", name: "Apple Watch", category: "Apple Ecosystem", targetPrice: 50000, amountSaved: 15000, priority: "Medium", targetYear: 2025, purchased: false, purchaseDate: null, notes: "Ultra 2 with all health features", imageUrl: "", tags: ["Want"], why: "Health tracking and productivity", images: [], recurringSaving: 2000, recurringFrequency: "Monthly", deposits: [], createdAt: "", updatedAt: "", order: 1, locked: false },
  { id: "g3", name: "AirPods Pro", category: "Apple Ecosystem", targetPrice: 25000, amountSaved: 25000, priority: "Low", targetYear: 2024, purchased: true, purchaseDate: "2024-06-15", notes: "For music and calls on the go", imageUrl: "", tags: ["Want"], why: "Better audio experience", images: [], recurringSaving: 0, recurringFrequency: "None", deposits: [], createdAt: "", updatedAt: "", order: 2, locked: false },
  { id: "g4", name: "MacBook Pro", category: "Apple Ecosystem", targetPrice: 200000, amountSaved: 50000, priority: "High", targetYear: 2025, purchased: false, purchaseDate: null, notes: "M4 Max with 64GB RAM for development", imageUrl: "", tags: ["Need"], why: "Primary development machine", images: [], recurringSaving: 10000, recurringFrequency: "Monthly", deposits: [], createdAt: "", updatedAt: "", order: 3, locked: false },
  { id: "g5", name: "Harley-Davidson", category: "Vehicles", targetPrice: 700000, amountSaved: 100000, priority: "Medium", targetYear: 2026, purchased: false, purchaseDate: null, notes: "Harley-Davidson Street Bob", imageUrl: "", tags: ["Luxury"], why: "Freedom on the open road", images: [], recurringSaving: 15000, recurringFrequency: "Monthly", deposits: [], createdAt: "", updatedAt: "", order: 4, locked: false },
  { id: "g6", name: "Maybach GLS 600", category: "Vehicles", targetPrice: 38000000, amountSaved: 500000, priority: "Low", targetYear: 2030, purchased: false, purchaseDate: null, notes: "Ultimate luxury SUV", imageUrl: "", tags: ["Luxury"], why: "Symbol of success and comfort for family", images: [], recurringSaving: 50000, recurringFrequency: "Monthly", deposits: [], createdAt: "", updatedAt: "", order: 5, locked: false },
  { id: "g7", name: "Dream House", category: "Real Estate", targetPrice: 50000000, amountSaved: 2000000, priority: "Critical", targetYear: 2030, purchased: false, purchaseDate: null, notes: "Modern villa with pool, home theater, and smart home features", imageUrl: "", tags: ["Need"], why: "Ultimate goal - a home for the family with all amenities", images: [], recurringSaving: 100000, recurringFrequency: "Monthly", deposits: [], createdAt: "", updatedAt: "", order: 6, locked: false },
  { id: "g8", name: "Japan", category: "Travel", targetPrice: 300000, amountSaved: 75000, priority: "Medium", targetYear: 2025, purchased: false, purchaseDate: null, notes: "2 weeks exploring Tokyo, Kyoto, and Osaka", imageUrl: "", tags: ["Want"], why: "Experience Japanese culture and technology", images: [], recurringSaving: 10000, recurringFrequency: "Monthly", deposits: [], createdAt: "", updatedAt: "", order: 7, locked: false },
  { id: "g9", name: "Europe", category: "Travel", targetPrice: 700000, amountSaved: 200000, priority: "Low", targetYear: 2026, purchased: false, purchaseDate: null, notes: "Switzerland, France, Italy, Spain - 3 week tour", imageUrl: "", tags: ["Want"], why: "See the world and gain new perspectives", images: [], recurringSaving: 15000, recurringFrequency: "Monthly", deposits: [], createdAt: "", updatedAt: "", order: 8, locked: false },
  { id: "g10", name: "USA Road Trip", category: "Travel", targetPrice: 600000, amountSaved: 100000, priority: "Low", targetYear: 2027, purchased: false, purchaseDate: null, notes: "Coast to coast road trip - Route 66", imageUrl: "", tags: ["Want"], why: "Classic American adventure", images: [], recurringSaving: 5000, recurringFrequency: "Monthly", deposits: [], createdAt: "", updatedAt: "", order: 9, locked: false },
  { id: "g11", name: "Office", category: "Business", targetPrice: 10000000, amountSaved: 1000000, priority: "High", targetYear: 2027, purchased: false, purchaseDate: null, notes: "Premium office space in business district", imageUrl: "", tags: ["Need"], why: "Professional workspace for the team", images: [], recurringSaving: 50000, recurringFrequency: "Monthly", deposits: [], createdAt: "", updatedAt: "", order: 10, locked: false },
  { id: "g12", name: "Recording Studio", category: "Business", targetPrice: 2000000, amountSaved: 300000, priority: "Medium", targetYear: 2026, purchased: false, purchaseDate: null, notes: "Professional music production studio", imageUrl: "", tags: ["Want"], why: "Produce high-quality music and podcasts", images: [], recurringSaving: 25000, recurringFrequency: "Monthly", deposits: [], createdAt: "", updatedAt: "", order: 11, locked: false },
  { id: "g13", name: "Apple Watch for Friend 1", category: "Gifts", targetPrice: 25000, amountSaved: 25000, priority: "Medium", targetYear: 2024, purchased: true, purchaseDate: "2024-12-25", notes: "Birthday gift for best friend", imageUrl: "", tags: ["Gift"], why: "Show appreciation for friendship", images: [], recurringSaving: 0, recurringFrequency: "None", deposits: [], createdAt: "", updatedAt: "", order: 12, locked: false },
  { id: "g14", name: "Apple Watch for Friend 2", category: "Gifts", targetPrice: 25000, amountSaved: 10000, priority: "Low", targetYear: 2025, purchased: false, purchaseDate: null, notes: "Anniversary gift", imageUrl: "", tags: ["Gift"], why: "Make someone special feel valued", images: [], recurringSaving: 2000, recurringFrequency: "Monthly", deposits: [], createdAt: "", updatedAt: "", order: 13, locked: false },
]

export const DEFAULT_DAILY_GOALS: DailyGoal[] = []

export const DEFAULT_PLAYBOOK: Playbook = {
  scriptVersions: [],
  objectionsDoc: "",
  demoFlow: "",
  n8nSummary: "",
  bugs: [],
}

export const DEFAULT_HABITS: Habit[] = [
  { id: "h1", name: "Gym", icon: "💪", streak: 0, lastCheckin: null, logs: [], createdAt: "" },
  { id: "h2", name: "Cold Calls", icon: "📞", streak: 0, lastCheckin: null, logs: [], createdAt: "" },
  { id: "h3", name: "Sales Calls", icon: "💼", streak: 0, lastCheckin: null, logs: [], createdAt: "" },
  { id: "h4", name: "Reading", icon: "📚", streak: 0, lastCheckin: null, logs: [], createdAt: "" },
  { id: "h5", name: "Coding", icon: "💻", streak: 0, lastCheckin: null, logs: [], createdAt: "" },
  { id: "h6", name: "Meditation", icon: "🧘", streak: 0, lastCheckin: null, logs: [], createdAt: "" },
  { id: "h7", name: "Wake Up Early", icon: "🌅", streak: 0, lastCheckin: null, logs: [], createdAt: "" },
  { id: "h8", name: "Water Intake", icon: "💧", streak: 0, lastCheckin: null, logs: [], createdAt: "" },
  { id: "h9", name: "Sleep", icon: "😴", streak: 0, lastCheckin: null, logs: [], createdAt: "" },
  { id: "h10", name: "Journaling / Planning", icon: "✍️", streak: 0, lastCheckin: null, logs: [], createdAt: "" },
  { id: "h11", name: "No Junk Food", icon: "🥗", streak: 0, lastCheckin: null, logs: [], createdAt: "" },
  { id: "h12", name: "Outreach (LinkedIn/Email)", icon: "📧", streak: 0, lastCheckin: null, logs: [], createdAt: "" },
  { id: "h13", name: "Learning (15 min)", icon: "🎓", streak: 0, lastCheckin: null, logs: [], createdAt: "" },
  { id: "h14", name: "Review Metrics", icon: "📊", streak: 0, lastCheckin: null, logs: [], createdAt: "" },
]

// Default habits introduced in app updates — always merged into existing user data
export const NEW_DEFAULT_HABIT_IDS = ["h10", "h11", "h12", "h13", "h14"]

export const DEFAULT_BUSINESS: BusinessMetrics = {
  revenue: 1500000, mrr: 125000, clients: 12,
  meetings: 8, coldCalls: 25, dealsClosed: 3, conversionRate: 12,
  monthlyData: [
    { month: "Jan", revenue: 1200000, mrr: 100000, clients: 10 },
    { month: "Feb", revenue: 1300000, mrr: 110000, clients: 11 },
    { month: "Mar", revenue: 1500000, mrr: 125000, clients: 12 },
    { month: "Apr", revenue: 1400000, mrr: 120000, clients: 11 },
    { month: "May", revenue: 1600000, mrr: 130000, clients: 13 },
    { month: "Jun", revenue: 1500000, mrr: 125000, clients: 12 },
  ],
}

export const DEFAULT_INVESTMENTS: Investment[] = [
  { id: "i1", type: "Mutual Funds", name: "Large Cap Fund", amount: 500000, returns: 12.5, allocation: 25 },
  { id: "i2", type: "Stocks", name: "Portfolio", amount: 300000, returns: 18, allocation: 15 },
  { id: "i3", type: "Crypto", name: "BTC/ETH", amount: 100000, returns: 45, allocation: 5 },
  { id: "i4", type: "Gold", name: "Digital Gold", amount: 200000, returns: 8, allocation: 10 },
  { id: "i5", type: "Business", name: "Main Business", amount: 900000, returns: 25, allocation: 45 },
]

export const DEFAULT_NET_WORTH: NetWorth = {
  cash: 500000, investments: 300000, stocks: 200000,
  mutualFunds: 500000, businessValue: 2000000, gold: 200000,
  crypto: 100000, vehicles: 700000, realEstate: 0,
  loans: 500000, creditCard: 50000, mortgage: 0,
}

export const DEFAULT_SETTINGS: Settings = {
  currency: "INR", customCurrencySymbol: "", theme: "dark",
  monthlyIncome: 250000, savingsRate: 30, businessProfitMargin: 40,
  locked: false,
}

export const DEFAULT_APP_DATA: AppData = {
  goals: DEFAULT_GOALS,
  dailyGoals: DEFAULT_DAILY_GOALS,
  weeklyReviews: [],
  clients: [],
  monthlyCheckpoints: [],
  playbook: DEFAULT_PLAYBOOK,
  habits: DEFAULT_HABITS,
  journal: [],
  business: DEFAULT_BUSINESS,
  investments: DEFAULT_INVESTMENTS,
  netWorth: DEFAULT_NET_WORTH,
  settings: DEFAULT_SETTINGS,
  achievements: [],
}
