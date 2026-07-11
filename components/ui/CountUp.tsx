"use client"

import { useEffect, useRef, useState } from "react"
import { formatCompactCurrency } from "@/lib/utils"

interface CountUpProps {
  value: number
  symbol?: string
  duration?: number
}

export default function CountUp({ value, symbol = "", duration = 1 }: CountUpProps) {
  const [display, setDisplay] = useState(0)
  const startTime = useRef<number | null>(null)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    startTime.current = null
    const startValue = 0

    function animate(timestamp: number) {
      if (!startTime.current) startTime.current = timestamp
      const elapsed = (timestamp - startTime.current) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(startValue + (value - startValue) * eased)

      if (progress < 1) {
        raf.current = requestAnimationFrame(animate)
      } else {
        setDisplay(value)
      }
    }

    raf.current = requestAnimationFrame(animate)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [value, duration])

  return <span>{formatCompactCurrency(Math.round(display), symbol)}</span>
}
