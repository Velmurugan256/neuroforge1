"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { jwtDecode } from "jwt-decode"
import { Loader2 } from "lucide-react"
import { config, getCognitoLoginUrl, getCognitoLogoutUrl, getCognitoTokenUrl } from "@/config/cognito-config"
import { setAuth, clearAuth, setLoading } from "@/store/slices/authSlice"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [tokens, setTokens] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const signIn = () => {
    window.location.href = getCognitoLoginUrl()
  }

  const signOut = useCallback(() => {
    console.log("🔧 Signing out user")
    setUser(null)
    setTokens(null)
    dispatch(clearAuth())
    localStorage.removeItem("cognito_tokens")
    window.location.href = getCognitoLogoutUrl()
  }, [dispatch])

  const handleRedirectCallback = useCallback(
    async (code) => {
      try {
        console.log("🔧 Starting token exchange...")
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: config.userPoolClientId,
          redirect_uri: config.redirectSignIn,
          code,
        })

        const response = await fetch(getCognitoTokenUrl(), {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        })

        if (!response.ok) {
          throw new Error(`Token exchange failed: ${response.statusText}`)
        }

        const tokenData = await response.json()
        console.log("🔧 Token exchange successful")
        
        setTokens(tokenData)
        localStorage.setItem("cognito_tokens", JSON.stringify(tokenData))

        const decodedUser = jwtDecode(tokenData.id_token)
        setUser(decodedUser)
        dispatch(setAuth({ user: decodedUser, token: tokenData.access_token }))
        
        console.log("🔧 User authenticated:", decodedUser.email || decodedUser.sub)

        // Clean up the URL and navigate to the main page
        window.history.replaceState({}, document.title, "/")
        // Don't navigate here, let the useEffect handle the redirect
      } catch (error) {
        console.error("Authentication callback failed:", error)
        // Don't call signOut here as it will cause a redirect loop
        localStorage.removeItem("cognito_tokens")
        setUser(null)
        setTokens(null)
        dispatch(clearAuth())
        navigate("/login", { replace: true })
      }
    },
    [navigate],
  )

  useEffect(() => {
    const checkSession = async () => {
      const params = new URLSearchParams(location.search)
      const code = params.get("code")

      if (code) {
        // This is a redirect from Cognito - keep loading state true until callback is complete
        console.log("🔧 Processing Cognito callback with code:", code)
        await handleRedirectCallback(code)
        setIsLoading(false)
      } else {
        // This is a normal page load, check for existing session
        const storedTokens = localStorage.getItem("cognito_tokens")
        if (storedTokens) {
          try {
            const parsedTokens = JSON.parse(storedTokens)
            const decodedUser = jwtDecode(parsedTokens.id_token)

            // Check if the token is expired
            if (decodedUser.exp * 1000 > Date.now()) {
              setTokens(parsedTokens)
              setUser(decodedUser)
              dispatch(setAuth({ user: decodedUser, token: parsedTokens.access_token }))
            } else {
              // Token is expired, clear session
              localStorage.removeItem("cognito_tokens")
              setUser(null)
              setTokens(null)
              dispatch(clearAuth())
            }
          } catch (error) {
            console.error("Failed to parse stored tokens:", error)
            localStorage.removeItem("cognito_tokens")
            setUser(null)
            setTokens(null)
            dispatch(clearAuth())
          }
        }
        setIsLoading(false)
      }
    }

    checkSession()
  }, [location.search, handleRedirectCallback, dispatch])

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mb-4" />
        <p className="text-lg text-slate-300">Initializing Session...</p>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, tokens, isAuthenticated: !!user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
