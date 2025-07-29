"use client"

import { useState, useMemo } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from "lucide-react"

// Import react-pdf CSS
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Configure PDF.js worker - use jsDelivr CDN which is reliable and matches exact version
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const PdfViewer = ({ content, fileUrl, fileName = "document.pdf" }) => {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Determine the PDF source - either URL (for new API) or blob URL (for base64 content)
  const pdfSource = useMemo(() => {
    // If we have a direct URL (new API response), use it
    if (fileUrl && typeof fileUrl === "string" && fileUrl.startsWith("http")) {
      return fileUrl
    }

    // If we have content (old API response), convert base64 to blob URL
    if (content) {
      try {
        const byteCharacters = atob(content)
        const byteNumbers = Array.from(byteCharacters, (c) => c.charCodeAt(0))
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: "application/pdf" })
        return URL.createObjectURL(blob)
      } catch (e) {
        console.error("❌ PDF decode failed:", e)
        setError("Failed to decode PDF content")
        return null
      }
    }

    setError("No PDF source available")
    return null
  }, [content, fileUrl])

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  const onDocumentLoadError = (error) => {
    setError("Failed to load PDF document")
    setLoading(false)
  }

  const goToPrevPage = () => setPageNumber(Math.max(1, pageNumber - 1))
  const goToNextPage = () => setPageNumber(Math.min(numPages, pageNumber + 1))
  const zoomIn = () => setScale(Math.min(3, scale + 0.2))
  const zoomOut = () => setScale(Math.max(0.5, scale - 0.2))
  const rotateDocument = () => setRotation((rotation + 90) % 360)

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-800">
        <div className="text-center p-8">
          <div className="text-red-400 text-lg mb-2">❌ PDF Preview Error</div>
          <div className="text-slate-400">{error}</div>
        </div>
      </div>
    )
  }

  if (!pdfSource) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-800">
        <div className="text-center p-8">
          <div className="text-slate-400">No PDF source available</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-slate-800 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-slate-300 min-w-[80px] text-center">
            {loading ? "Loading..." : `${pageNumber} / ${numPages}`}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-sm text-slate-300 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={rotateDocument}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
          >
            <RotateCw size={16} />
          </button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="flex-1 overflow-auto bg-slate-800 flex items-center justify-center p-4">
        <Document
          file={pdfSource}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="text-slate-400 text-center p-8">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Loading PDF...
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            className="shadow-lg"
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  )
}

export default PdfViewer
