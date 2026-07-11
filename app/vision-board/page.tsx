"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function VisionBoardRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/goals?tab=board") }, [router])
  return <div className="min-h-screen bg-[var(--background)]" />
}
