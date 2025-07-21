"use client"

import { useMemo } from "react"

const PdfViewer = ({ content, fileName = "document.pdf" }) => {
  const blobUrl = useMemo(() => {
    try {
      const byteCharacters = atob(content)
      const byteNumbers = Array.from(byteCharacters, (c) => c.charCodeAt(0))
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: "application/pdf" })
      return URL.createObjectURL(blob)
    } catch (e) {
      console.error("❌ PDF decode failed:", e)
      return null
    }
  }, [content])

  if (!blobUrl) {
    return <div style={{ padding: "1rem", color: "red" }}>❌ Unable to preview PDF file.</div>
  }

  return <iframe src={blobUrl} style={{ width: "100%", height: "100%", border: "none" }} title={fileName} />
}

export default PdfViewer
