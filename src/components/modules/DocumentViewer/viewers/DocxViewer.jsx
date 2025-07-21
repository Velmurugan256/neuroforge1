"use client"

import { useMemo } from "react"

/** ------------------------------------------------------------------
 *  Helpers
 *  -----------------------------------------------------------------*/

/**
 * Removes any data-URI prefix, strips stray whitespace / line-breaks,
 * converts URL-safe Base64 to standard Base64, and fixes missing “=”
 * padding so `atob()` won’t throw.
 */
function sanitizeBase64(b64) {
  // 1 ▸ strip “data:…;base64,” if present
  let cleaned = b64.includes(",") ? b64.split(",")[1] : b64

  // 2 ▸ trim whitespace & line breaks
  cleaned = cleaned.replace(/\s+/g, "")

  // 3 ▸ convert URL-safe alphabet to standard Base64 alphabet
  cleaned = cleaned.replace(/-/g, "+").replace(/_/g, "/")

  // 4 ▸ add missing padding (“=” must make length % 4 === 0)
  const padding = cleaned.length % 4
  if (padding) cleaned += "=".repeat(4 - padding)

  return cleaned
}

/**
 * Decodes a Base64 string to a Uint8Array without using
 * any browser-specific binary extensions.
 */
function base64ToUint8Array(b64) {
  const binary = atob(b64)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

/** ------------------------------------------------------------------
 *  Component
 *  -----------------------------------------------------------------*/

const DocxViewer = ({ content, fileName = "document.docx" }) => {
  const blobUrl = useMemo(() => {
    if (!content) return null

    try {
      const clean = sanitizeBase64(content)
      const byteArray = base64ToUint8Array(clean)
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })

      return URL.createObjectURL(blob)
    } catch (err) {
      console.error("❌ DOCX decode failed:", err)
      return null
    }
  }, [content])

  /* -------------------------------------------------------------- */

  if (!blobUrl) {
    return <div style={{ padding: "1rem", color: "red" }}>❌ Unable to preview DOCX file.</div>
  }

  /**
   * ⚠️  Google’s gview service *cannot* fetch `blob:` URLs
   *     because they live only inside the user’s browser.
   *     Modern Chromium-based browsers, however, can render
   *     a DOCX directly from a `blob:` URL in an <iframe>.
   *
   *     👉  If gview is *required* (e.g. for Safari / Firefox),
   *         you’ll need to upload the file to S3 or another
   *         publicly accessible HTTPS URL and point gview there
   *         instead.  Otherwise, drop gview and just iframe the
   *         blobUrl itself.
   */

  return (
    <iframe
      /* Use blobUrl directly; try switching to gview only if your
         target browsers cannot handle native DOCX rendering. */
      src={blobUrl}
      /* If you *must* keep gview, swap the line above for:
       * src={`https://docs.google.com/gview?url=${encodeURIComponent(blobUrl)}&embedded=true`}
       */
      style={{ width: "100%", height: "100%", border: "none" }}
      title={fileName}
    />
  )
}

export default DocxViewer
