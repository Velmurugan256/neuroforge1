"use client"

import { useState, useEffect } from "react"
import Modal from "@/components/ui/Modal"

const GetDetailsModal = ({ isOpen, onClose, onSubmit }) => {
  const [docId, setDocId] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      setDocId("")
      setError("")
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!docId.trim()) {
      setError("Document ID cannot be empty.")
      return
    }
    onSubmit(docId.trim())
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Get File Status Details">
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-slate-400 text-sm">
          Enter the full Document ID to retrieve its latest status from the database.
        </p>
        <div>
          <label htmlFor="docId" className="sr-only">
            Document ID
          </label>
          <input
            id="docId"
            type="text"
            value={docId}
            onChange={(e) => {
              setDocId(e.target.value)
              if (error) setError("")
            }}
            placeholder="e.g., 'folder/document.pdf'"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!docId.trim()}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600"
          >
            Get Details
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default GetDetailsModal
