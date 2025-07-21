"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"

/**
 * A custom, from-scratch modal dialog for capturing text input.
 * No dependencies on shadcn/ui or Radix.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the dialog is open.
 * @param {() => void} props.onClose - Function to call when the dialog should close.
 * @param {(value: string) => void} props.onSubmit - Function to call with the input value on submission.
 * @param {string} props.title - The title of the dialog.
 * @param {string} [props.description] - Optional description text below the title.
 * @param {string} [props.inputLabel] - The label for the input field.
 * @param {string} [props.initialValue] - The initial value of the input field.
 * @param {string} [props.submitButtonText] - The text for the submit button.
 */
const InputDialog = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  inputLabel = "Name",
  initialValue = "",
  submitButtonText = "Confirm",
}) => {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef(null)

  // Reset value and focus input when the dialog opens
  useEffect(() => {
    if (isOpen) {
      setValue(initialValue)
      // Focus the input field shortly after the dialog opens
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, initialValue])

  // Handle Escape key press to close the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(value.trim())
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  // Use a portal to render the modal at the top level of the DOM
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose} // Close on backdrop click
    >
      <div
        className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex flex-col space-y-1.5 mb-4">
          <h2 className="text-lg font-semibold leading-none tracking-tight text-white">{title}</h2>
          {description && <p className="text-sm text-slate-400">{description}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name-input" className="text-right text-sm font-medium text-slate-400">
                {inputLabel}
              </label>
              <input
                id="name-input"
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="col-span-3 flex h-9 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-200 shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 bg-slate-700 text-slate-200 shadow-sm hover:bg-slate-600 h-9 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 bg-cyan-600 text-white shadow hover:bg-cyan-500 h-9 px-4 py-2 mb-2 sm:mb-0"
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

export default InputDialog
