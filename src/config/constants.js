/* Centralized API configuration */
export const BASE_URL = "https://a4pifj82cl.execute-api.us-east-1.amazonaws.com/prod"
export const BUCKET = "neuroforge-dev"

/* Mock bearer until Cognito / JWT is wired in */
export const AUTH_HEADER = { Authorization: "Bearer mock.jwt.token" }
