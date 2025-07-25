"use client"
import { MessageCircle, X } from "lucide-react"

const PlaygroundButton = ({ onToggle, isOpen }) => {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
        isOpen
          ? "bg-red-600 hover:bg-red-500 shadow-red-500/30"
          : "bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/30"
      }`}
      title={isOpen ? "Close Playground" : "Neurocache Playground"}
    >
      <div className="flex items-center justify-center w-full h-full">
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </div>

      {/* Pulse animation when closed */}
      {!isOpen && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 animate-ping opacity-20"></div>
      )}

      {/* Notification badge */}
      {!isOpen && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">!</span>
        </div>
      )}
    </button>
  )
}

export default PlaygroundButton
