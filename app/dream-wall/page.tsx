"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DreamWallRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/goals?tab=wall") }, [router])
  return <div className="min-h-screen bg-[var(--background)]" />
}
