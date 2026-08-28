"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import { motion } from "framer-motion"
import { CheckSquare, StretchHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface Exercise {
  id: string
  name: string
  metric: string
  cue: string
}

interface Section {
  id: string
  title: string
  exercises: Exercise[]
}

const SECTIONS: Section[] = [
  {
    id: "anterior-pelvic-tilt",
    title: "Anterior Pelvic Tilt",
    exercises: [
      { id: "hip-flexor-stretch", name: "Hip Flexor Stretch", metric: "2×30s/side", cue: "Kneel, squeeze glute, tuck pelvis forward" },
      { id: "glute-bridge", name: "Glute Bridge", metric: "3×15", cue: "Drive through heels, squeeze glutes at top" },
      { id: "dead-bug", name: "Dead Bug", metric: "3×10/side", cue: "Lower back pressed flat into floor" },
      { id: "plank", name: "Plank", metric: "3×30s", cue: "Tuck tailbone, brace abs, neutral neck" },
    ],
  },
  {
    id: "rounded-shoulders",
    title: "Rounded Shoulders",
    exercises: [
      { id: "doorway-chest-stretch", name: "Doorway Chest Stretch", metric: "2×30s", cue: "Forearm on frame, lean forward gently" },
      { id: "band-pull-aparts", name: "Band Pull-Aparts", metric: "3×15", cue: "Squeeze shoulder blades together" },
      { id: "wall-angels", name: "Wall Angels", metric: "3×10", cue: "Keep back, elbows, wrists on the wall" },
      { id: "face-pulls", name: "Face Pulls", metric: "3×15", cue: "Pull to temples, elbows high" },
    ],
  },
  {
    id: "forward-head-neck",
    title: "Forward Head / Neck",
    exercises: [
      { id: "chin-tucks", name: "Chin Tucks", metric: "3×10", cue: "Glide chin straight back, make a double chin" },
      { id: "levator-scapulae-stretch", name: "Levator Scapulae Stretch", metric: "2×30s/side", cue: "Tilt head down toward armpit" },
      { id: "upper-trap-stretch", name: "Upper Trap Stretch", metric: "2×30s/side", cue: "Ear toward shoulder, opposite hand helps" },
    ],
  },
]

interface DailyState {
  done: Record<string, boolean>
  notes: Record<string, string>
}

function todayKey(): string {
  return new Date().toISOString().split("T")[0]
}

export default function PosturePage() {
  const [date, setDate] = useState(todayKey())
  const [state, setState] = useState<DailyState>({ done: {}, notes: {} })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const key = `posture-${date}`
    try {
      const raw = localStorage.getItem(key)
      setState(raw ? JSON.parse(raw) : { done: {}, notes: {} })
    } catch {
      setState({ done: {}, notes: {} })
    }
    setLoaded(true)
  }, [date])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(`posture-${date}`, JSON.stringify(state))
    }
  }, [state, loaded, date])

  const toggle = (id: string) => {
    setState(prev => ({
      ...prev,
      done: { ...prev.done, [id]: !prev.done[id] },
    }))
  }

  const setNote = (id: string, value: string) => {
    setState(prev => ({
      ...prev,
      notes: { ...prev.notes, [id]: value },
    }))
  }

  const overall = SECTIONS.flatMap(s => s.exercises)
  const doneCount = overall.filter(e => state.done[e.id]).length

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div>
              <h1 className="text-2xl font-bold text-white">Posture Routine</h1>
              <p className="text-white/40 text-sm mt-1">Daily corrective exercises &bull; {doneCount}/{overall.length} done today</p>
            </div>

            <div className="card p-4 mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-white/60">
                  <CheckSquare size={16} className="text-[#667eea]" />
                  <span className="text-sm font-medium">Exercise day</span>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={e => e.target.value && setDate(e.target.value)}
                  className="input-premium !w-auto"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-40 h-2 progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(doneCount / overall.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-white">{doneCount}/{overall.length}</span>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {SECTIONS.map(section => (
                <div key={section.id} className="card overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-[#667eea]/15 to-[#764ba2]/15 border-b border-white/[0.06] flex items-center gap-2">
                    <StretchHorizontal size={16} className="text-[#667eea]" />
                    <span className="text-sm font-semibold text-white">{section.title}</span>
                  </div>
                  <div className="bg-white/[0.01]">
                    {section.exercises.map(ex => {
                      const done = !!state.done[ex.id]
                      return (
                        <div
                          key={ex.id}
                          className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] last:border-b-0"
                        >
                          <button
                            onClick={() => toggle(ex.id)}
                            aria-label={`Mark ${ex.name} ${done ? "not done" : "done"}`}
                            className={cn(
                              "w-6 h-6 mt-0.5 shrink-0 rounded-md flex items-center justify-center transition-all border",
                              done
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-white/5 text-white/20 border-white/10 hover:bg-white/10"
                            )}
                          >
                            {done ? "✓" : ""}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn(
                                "text-sm font-medium",
                                done ? "text-white/40 line-through" : "text-white/80"
                              )}>
                                {ex.name}
                              </span>
                              <span className="text-xs text-[#667eea] font-mono">{ex.metric}</span>
                            </div>
                            <input
                              type="text"
                              value={state.notes[ex.id] ?? ""}
                              onChange={e => setNote(ex.id, e.target.value)}
                              placeholder={`Cue: ${ex.cue}`}
                              className="input-premium !rounded-md mt-1.5 !py-1.5 !text-xs"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
