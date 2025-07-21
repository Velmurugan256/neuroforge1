"use client"

import { useState, useEffect } from "react"
import Modal from "@/components/ui/Modal"

const CreateFileModal = ({ isOpen, onClose, onSubmit, parentPath, fileType }) => {
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")

  // Reset state when the modal is opened or closed
  useEffect(() => {
    if (isOpen) {
      setFileName("")
      setError("")
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!fileName.trim()) {
      setError("File name cannot be empty.")
      return
    }
    if (/[/\\?%*:|"<>]/g.test(fileName)) {
      setError("File name contains invalid characters.")
      return
    }
    onSubmit(fileName.trim())
    onClose()
  }

  const modalTitle = `Create New .${fileType} File`

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-slate-400 text-sm">
          Enter a name for the new file (without the extension).
          {parentPath && (
            <div className="mt-2">
              Will be created inside:{" "}
              <span className="font-mono bg-slate-800 px-1.5 py-1 rounded text-cyan-300">{parentPath}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="fileName" className="sr-only">
            File Name
          </label>
          <div className="flex items-center">
            <input
              id="fileName"
              type="text"
              value={fileName}
              onChange={(e) => {
                setFileName(e.target.value)
                if (error) setError("")
              }}
              placeholder="e.g., 'configuration' or 'notes'"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-l-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              autoFocus
            />
            <span className="inline-flex items-center px-3 py-2 text-slate-300 bg-slate-700 border border-l-0 border-slate-700 rounded-r-md">
              .{fileType}
            </span>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!fileName.trim()}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors shadow-lg shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
          >
            Create File
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateFileModal
