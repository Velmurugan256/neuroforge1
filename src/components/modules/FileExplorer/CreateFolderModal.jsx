"use client"

import { useState, useEffect } from "react"
import Modal from "@/components/ui/Modal" // 👈 Use the new custom modal

const CreateFolderModal = ({ isOpen, onClose, onSubmit, parentPath }) => {
  const [folderName, setFolderName] = useState("")
  const [error, setError] = useState("")

  // Reset state when the modal is opened or closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFolderName("")
        setError("")
      }, 200) // Delay reset to allow for closing animation
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!folderName.trim()) {
      setError("Folder name cannot be empty.")
      return
    }
    if (/[/\\?%*:|"<>]/g.test(folderName)) {
      setError("Folder name contains invalid characters.")
      return
    }
    onSubmit(folderName.trim())
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Folder">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-slate-400 text-sm">
          Enter a name for the new folder.
          {parentPath && (
            <div className="mt-2">
              Will be created inside:{" "}
              <span className="font-mono bg-slate-800 px-1.5 py-1 rounded text-cyan-300">{parentPath}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="folderName" className="sr-only">
            Folder Name
          </label>
          <input
            id="folderName"
            type="text"
            value={folderName}
            onChange={(e) => {
              setFolderName(e.target.value)
              if (error) setError("")
            }}
            placeholder="e.g., 'Project Documents'"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            autoFocus
          />
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
            disabled={!folderName.trim()}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors shadow-lg shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
          >
            Create Folder
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateFolderModal
