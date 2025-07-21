"use client"

import { useState, useEffect } from "react"

const useDocumentIds = () => {
  const [documentIds, setDocumentIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDocumentIds = async () => {
      try {
        const response = await fetch(
          "https://a4pifj82cl.execute-api.us-east-1.amazonaws.com/prod/status/list?limit=1000",
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setDocumentIds(data)
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    }

    fetchDocumentIds()
  }, [])

  return { documentIds, loading, error }
}

export default useDocumentIds
