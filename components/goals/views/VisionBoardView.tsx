"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { Plus, X, Trash2, GripVertical } from "lucide-react"
import { generateId } from "@/lib/utils"
import toast from "react-hot-toast"

interface VisionImage {
  id: string
  src: string
  label: string
}

export default function VisionBoardView() {
  const [images, setImages] = useState<VisionImage[]>(() => {
    try {
      const saved = localStorage.getItem("lifeos_vision")
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [showAdd, setShowAdd] = useState(false)
  const [url, setUrl] = useState("")
  const [label, setLabel] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const saveImages = (newImages: VisionImage[]) => {
    setImages(newImages)
    localStorage.setItem("lifeos_vision", JSON.stringify(newImages))
  }

  const handleAdd = () => {
    if (!url.trim()) { toast.error("Enter an image URL"); return }
    const newImg: VisionImage = { id: generateId(), src: url.trim(), label: label.trim() || "Dream" }
    saveImages([...images, newImg])
    setUrl(""); setLabel(""); setShowAdd(false)
    toast.success("Image added to vision board")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const newImg: VisionImage = { id: generateId(), src: ev.target?.result as string, label: file.name.split(".")[0] }
      saveImages([...images, newImg])
      toast.success("Image added!")
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (id: string) => {
    saveImages(images.filter(img => img.id !== id))
    toast.success("Image removed")
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Vision Board</h1>
          <p className="text-white/40 text-sm mt-1">Visualize your dreams with images</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="btn-ghost flex items-center gap-2">
            Upload
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          <button onClick={() => setShowAdd(!showAdd)} className="btn-premium flex items-center gap-2">
            <Plus size={16} /> Add URL
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="card p-4">
              <div className="flex gap-3">
                <input className="input-premium flex-1" placeholder="Image URL" value={url} onChange={e => setUrl(e.target.value)} />
                <input className="input-premium w-40" placeholder="Label (optional)" value={label} onChange={e => setLabel(e.target.value)} />
                <button onClick={handleAdd} className="btn-premium">Add</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {images.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🖼</div>
          <p className="text-white/40 text-sm">Add images to visualize your dreams</p>
        </div>
      ) : (
        <Reorder.Group axis="y" values={images} onReorder={saveImages} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <Reorder.Item key={img.id} value={img} className="relative group cursor-grab active:cursor-grabbing">
              <div className="card overflow-hidden aspect-[4/3] relative">
                <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={16} className="text-white/60" />
                </div>
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-2 right-2 p-1.5 rounded bg-black/50 text-white/60 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white/80 font-medium">{img.label}</span>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </>
  )
}
