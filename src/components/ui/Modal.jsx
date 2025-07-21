"use client"

import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

const Modal = ({ isOpen, onClose, title, children }) => {
  // Close modal on 'Escape' key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Use a portal to render the modal at the top of the DOM tree
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-md m-4 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export default Modal
