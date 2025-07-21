"use client"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Loader2 } from "lucide-react"

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  
  // Check if we're in the middle of processing a Cognito callback
  const isAuthCallback = new URLSearchParams(location.search).has('code')

  if (isLoading || isAuthCallback) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mb-4" />
        <p className="text-lg text-slate-300">
          {isAuthCallback ? "Processing Authentication..." : "Verifying Authentication..."}
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
