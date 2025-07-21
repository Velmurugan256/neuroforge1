// Validate required environment variables
const validateEnvVar = (name, value) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

// Extract region from User Pool ID (format: region_poolId)
const extractRegion = (userPoolId) => {
  if (!userPoolId) return null
  return userPoolId.split('_')[0]
}

// Safe way to get current origin (handles SSR)
const getOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  // Fallback for SSR or when window is not available
  return import.meta.env.VITE_APP_BASE_URL || 'http://localhost:5173'
}

// Safe way to get sign-out redirect URL
const getSignOutUrl = () => {
  const origin = getOrigin()
  return `${origin}/login`
}

export const config = {
  userPoolId: validateEnvVar('VITE_APP_COGNITO_USER_POOL_ID', import.meta.env.VITE_APP_COGNITO_USER_POOL_ID),
  userPoolClientId: validateEnvVar('VITE_APP_COGNITO_USER_POOL_CLIENT_ID', import.meta.env.VITE_APP_COGNITO_USER_POOL_CLIENT_ID),
  domain: validateEnvVar('VITE_APP_COGNITO_DOMAIN', import.meta.env.VITE_APP_COGNITO_DOMAIN),
  region: extractRegion(import.meta.env.VITE_APP_COGNITO_USER_POOL_ID),
  redirectSignIn: getOrigin(),
  redirectSignOut: getSignOutUrl(),
  responseType: "code",
  // The scopes must match what's configured in your Cognito App Client
  scope: ["email", "openid", "phone"].join(" "), // Should generate: email openid phone
}

/**
 * Constructs the URL for the Cognito Hosted UI login page.
 */
export const getCognitoLoginUrl = () => {
  try {
    const params = new URLSearchParams({
      client_id: config.userPoolClientId,
      response_type: config.responseType,
      scope: config.scope,
      redirect_uri: config.redirectSignIn,
    })
    
    return `https://${config.domain}/login?${params.toString()}`
  } catch (error) {
    console.error('Error constructing Cognito login URL:', error)
    throw error
  }
}

/**
 * Constructs the URL for the Cognito Hosted UI logout page.
 */
export const getCognitoLogoutUrl = () => {
  try {
    const params = new URLSearchParams({
      client_id: config.userPoolClientId,
      logout_uri: config.redirectSignOut,
    })
    return `https://${config.domain}/logout?${params.toString()}`
  } catch (error) {
    console.error('Error constructing Cognito logout URL:', error)
    throw error
  }
}

/**
 * Returns the URL for Cognito's token endpoint.
 */
export const getCognitoTokenUrl = () => {
  try {
    return `https://${config.domain}/oauth2/token`
  } catch (error) {
    console.error('Error constructing Cognito token URL:', error)
    throw error
  }
}

/**
 * Returns the URL for Cognito's user info endpoint.
 */
export const getCognitoUserInfoUrl = () => {
  try {
    return `https://${config.domain}/oauth2/userInfo`
  } catch (error) {
    console.error('Error constructing Cognito user info URL:', error)
    throw error
  }
}

/**
 * Validates if all required Cognito configuration is present.
 */
export const validateCognitoConfig = () => {
  const requiredFields = ['userPoolId', 'userPoolClientId', 'domain']
  const missingFields = requiredFields.filter(field => !config[field])
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required Cognito configuration: ${missingFields.join(', ')}`)
  }
  
  return true
}
