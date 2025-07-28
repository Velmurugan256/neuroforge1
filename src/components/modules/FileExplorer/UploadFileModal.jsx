import { useState, useRef } from "react"
import { X, Upload, File, AlertCircle } from "lucide-react"
import Modal from "@/components/ui/Modal"

const UploadFileModal = ({ isOpen, onClose, onSubmit, parentPath }) => {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const allowedExtensions = ['pdf', 'txt', 'json']
  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const handleReset = () => {
    setSelectedFiles([])
    setDragActive(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const validateFile = (file) => {
    const extension = file.name.split('.').pop().toLowerCase()
    
    if (!allowedExtensions.includes(extension)) {
      return `File type .${extension} is not allowed. Only PDF, TXT, and JSON files are supported.`
    }
    
    if (file.size > maxFileSize) {
      return `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    }
    
    return null
  }

  const processFiles = (files) => {
    const validFiles = []
    const errors = []

    Array.from(files).forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push({ file: file.name, error })
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      errors.forEach(({ file, error }) => {
        console.warn(`File ${file}: ${error}`)
      })
    }

    setSelectedFiles(prev => [...prev, ...validFiles])
    return { validFiles, errors }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFiles(files)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return

    try {
      for (const file of selectedFiles) {
        await onSubmit(parentPath, file)
      }
      handleClose()
    } catch (error) {
      console.error("Upload failed:", error)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase()
    switch (extension) {
      case 'pdf':
        return '📄'
      case 'txt':
        return '📝'
      case 'json':
        return '🔧'
      default:
        return '📁'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="600px">
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Upload Files</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-slate-300 text-sm mb-2">
            Upload to: <span className="text-cyan-400 font-medium">{parentPath || "root"}</span>
          </p>
          <p className="text-slate-400 text-xs">
            Supported formats: PDF, TXT, JSON • Max size: 10MB per file
          </p>
        </div>

        {/* File Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-cyan-500 bg-cyan-500/10"
              : "border-slate-600 hover:border-slate-500"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.json"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-white font-medium">Drop files here or click to browse</p>
              <p className="text-slate-400 text-sm">PDF, TXT, and JSON files only</p>
            </div>
          </div>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="text-white font-medium mb-3">Selected Files ({selectedFiles.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-slate-700"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-lg flex-shrink-0">{getFileIcon(file.name)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{file.name}</p>
                      <p className="text-slate-400 text-xs">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-slate-400 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedFiles.length === 0}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white font-medium transition-colors"
          >
            Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default UploadFileModal
