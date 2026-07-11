"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SimulatorRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/goals?tab=simulator") }, [router])
  return <div className="min-h-screen bg-[var(--background)]" />
}
