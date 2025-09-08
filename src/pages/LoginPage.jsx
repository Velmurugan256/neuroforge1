"use client"
import { useAuth } from "@/context/AuthContext"
import { Navigate } from "react-router-dom"
import { LogIn } from "lucide-react"

const LoginPage = () => {
  const { signIn, isAuthenticated, isLoading } = useAuth()

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Don't render login form while checking authentication
  if (isLoading) {
    return null // AuthContext will show loading spinner
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
      <div className="text-center max-w-md animate-fade-in p-8">
        <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/20">
          <span className="text-4xl">🧠</span>
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Welcome to NeuroCore
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-8">
          Sign in to access your document intelligence dashboard.
        </p>
        <button
          onClick={signIn}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg text-lg flex items-center justify-center gap-3 w-full transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
        >
          <LogIn className="w-6 h-6" />
          Sign In with Cognito
        </button>
      </div>
    </div>
  )
}

export default LoginPage
