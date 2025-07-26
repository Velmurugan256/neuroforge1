/**
 * NeuroForge RAG API Integration
 * Handles chat requests to the RAG system with proper error handling
 */
import { ENDAVA_API_URL } from "@/config/constants"

/**
 * Send a question to the NeuroForge RAG API
 * @param {string} question - The user's question
 * @returns {Promise<Object>} - The RAG response with matches and metadata
 */
export const sendQuestionToRAG = async (question) => {
  if (!question || typeof question !== 'string' || !question.trim()) {
    throw new Error('Question is required and must be a non-empty string')
  }

  try {
    const response = await fetch(`${ENDAVA_API_URL}/Neruoforge_RAG`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any required authentication headers here
        // 'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        question: question.trim()
      })
    })

    if (!response.ok) {
      // Handle different HTTP error codes
      switch (response.status) {
        case 400:
          throw new Error('Invalid question format. Please check your input.')
        case 401:
          throw new Error('Authentication required. Please log in again.')
        case 403:
          throw new Error('Access denied. You do not have permission to use this service.')
        case 404:
          throw new Error('RAG service not found. Please contact support.')
        case 429:
          throw new Error('Too many requests. Please wait a moment and try again.')
        case 500:
          throw new Error('Server error. Please try again later.')
        case 503:
          throw new Error('RAG service is temporarily unavailable. Please try again later.')
        default:
          throw new Error(`Request failed with status ${response.status}`)
      }
    }

    const data = await response.json()

    // Validate the response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from RAG API')
    }

    if (!Array.isArray(data.matches)) {
      throw new Error('Invalid response: missing or invalid matches array')
    }

    return data
  } catch (error) {
    // Handle network errors and other issues
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.')
    }
    
    // Re-throw our custom errors
    if (error.message.includes('Question is required') || 
        error.message.includes('Invalid question format') ||
        error.message.includes('Authentication required') ||
        error.message.includes('Access denied') ||
        error.message.includes('RAG service') ||
        error.message.includes('Too many requests') ||
        error.message.includes('Server error') ||
        error.message.includes('Network error') ||
        error.message.includes('Invalid response')) {
      throw error
    }

    // Handle unexpected errors
    console.error('Unexpected error in RAG API call:', error)
    throw new Error('An unexpected error occurred. Please try again.')
  }
}

/**
 * Format RAG response into a readable message
 * @param {Object} ragResponse - The response from the RAG API
 * @param {string} originalQuestion - The original user question
 * @returns {string} - Formatted response text
 */
export const formatRAGResponse = (ragResponse, originalQuestion) => {
  if (!ragResponse || !ragResponse.matches || ragResponse.matches.length === 0) {
    return `I couldn't find any relevant information for "${originalQuestion}". Please try rephrasing your question or check if the documents contain the information you're looking for.`
  }

  const { matches, used_url } = ragResponse
  
  let response = `Based on your question "${originalQuestion}", here's what I found:\n\n`

  matches.forEach((match, index) => {
    const { text, score, doc_id, metadata } = match
    const confidence = Math.round(score * 100)
    
    response += `**Result ${index + 1}** (${confidence}% relevance):\n`
    response += `${text}\n\n`
    
    if (metadata) {
      response += `📄 **Source**: ${metadata.source || 'Unknown document'}`
      if (metadata.page) {
        response += ` (Page ${metadata.page})`
      }
      response += `\n`
      response += `🆔 **Document ID**: ${doc_id}\n\n`
    }
    
    response += '---\n\n'
  })

  // Add metadata information
  if (used_url) {
    response += `*Query processed via: ${used_url}*\n`
  }
  
  response += `*Found ${matches.length} relevant result${matches.length !== 1 ? 's' : ''} from your document collection.*`

  return response
}

/**
 * Get a user-friendly error message
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred.'
  
  return error.message || 'An unexpected error occurred. Please try again.'
}
