"use client"

import { Compass, FileCode, BarChart3 } from "lucide-react"

const MobileNav = ({ activePanel, setActivePanel }) => {
  const navItems = [
    { id: "explorer", icon: Compass, label: "Explorer" },
    { id: "viewer", icon: FileCode, label: "Viewer" },
    { id: "stats", icon: BarChart3, label: "Stats" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800/50 flex justify-around items-center h-16 z-50">
      {navItems.map(({ id, icon: Icon, label }) => {
        const isActive = activePanel === id
        return (
          <button
            key={id}
            onClick={() => setActivePanel(id)}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-200 ${
              isActive ? "text-cyan-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default MobileNav
