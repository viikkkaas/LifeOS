import type { Metadata } from "next"
import { AppProvider } from "@/store/AppContext"
import { Toaster } from "react-hot-toast"
import "./globals.css"

export const metadata: Metadata = {
  title: "LifeOS - Your Financial Operating System",
  description: "Track dreams, goals, and financial progress",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#13131f",
                color: "#f1f3f9",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#34d399", secondary: "#13131f" } },
            }}
          />
        </AppProvider>
      </body>
    </html>
  )
}
