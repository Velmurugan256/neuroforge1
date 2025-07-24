/* Centralized API configuration */
export const BASE_URL = "https://a4pifj82cl.execute-api.us-east-1.amazonaws.com/prod"
export const BUCKET = "neuroforge-dev-v-02"

export const ENDAVA_API_URL = "https://yb40fa4yg6.execute-api.us-east-1.amazonaws.com/Prod"

/* Dynamic Auth Header Function - gets current Cognito token */
export const getAuthHeaders = () => {
  try {
    const storedTokens = localStorage.getItem("cognito_tokens")
    if (storedTokens) {
      const tokens = JSON.parse(storedTokens)
      if (tokens.access_token) {
        return { Authorization: `Bearer ${tokens.access_token}` }
      }
    }
  } catch (error) {
    console.warn("Failed to get auth token:", error)
  }
  
  // Fallback to mock token for development
  return { Authorization: "Bearer mock.jwt.token" }
}

/* Legacy export for backward compatibility - will be phased out */
export const AUTH_HEADER = { Authorization: "Bearer mock.jwt.token" }
