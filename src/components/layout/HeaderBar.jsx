"use client"

import { UserCircle, LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useMediaQuery } from "@/hooks/useMediaQuery"

const HeaderBar = () => {
  const { user, signOut } = useAuth()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const username = user?.email || user?.["cognito:username"] || "Authenticated User"

  return (
    <header className="bg-slate-950/80 backdrop-blur-sm px-4 sm:px-6 py-3 flex justify-between items-center border-b border-slate-800/50 h-16 flex-shrink-0">
      {/* Left Side: Logo and Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <span role="img" aria-label="brain" className="text-lg">
            🧠
          </span>
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          NEUROFORGE
        </span>
      </div>

      {/* Right Side: User Info / Sign Out */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-cyan-400" />
          {!isMobile && <span className="text-sm font-medium text-slate-300">{username}</span>}
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 bg-slate-800/50 hover:bg-red-600/20 border border-slate-700/50 hover:border-red-500/30 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-red-400 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}

export default HeaderBar
