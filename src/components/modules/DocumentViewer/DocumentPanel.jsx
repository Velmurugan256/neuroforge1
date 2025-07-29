"use client"
import TextViewer from "./viewers/TextViewer"
import JsonTableViewer from "./viewers/JsonTableViewer"
import PdfViewer from "./viewers/PdfViewer"
import DocxViewer from "./viewers/DocxViewer"
import ExcelViewer from "./viewers/ExcelViewer"
import ChatInterface from "../ChatPlayground/ChatInterface"

const DocumentPanel = ({ document, onClose }) => {
  const { name, path, type, content } = document

  const renderViewer = () => {
    const codeExtensions = ["js", "ts", "jsx", "tsx", "css", "html", "md", "py", "go", "rs", "xml", "yml", "toml"]
    if (codeExtensions.includes(type) || type === "txt") {
      return <TextViewer content={content} filePath={path} />
    }

    switch (type) {
      case "playground":
        return <ChatInterface onClose={() => onClose(document)} />
      case "json":
        return <JsonTableViewer content={content} filePath={path} />
      case "pdf":
        // For PDFs, content is now the URL (new API) or base64 content (old API)
        if (typeof content === "string" && content.startsWith("http")) {
          return <PdfViewer fileUrl={content} filePath={path} />
        } else {
          return <PdfViewer content={content} filePath={path} />
        }
      case "docx":
        return <DocxViewer fileUrl={content} filePath={path} />
      case "xlsx":
      case "xls":
        return <ExcelViewer fileUrl={content} filePath={path} />
      default:
        // Fallback for unknown types that might be text-based
        if (typeof content === "string" && !content.startsWith("data:")) {
          return <TextViewer content={content} filePath={path} />
        }
        return (
          <div className="p-4 text-slate-400">
            Preview not available for file type: <span className="font-mono text-cyan-400">{type}</span>
          </div>
        )
    }
  }

  return (
    // This container needs height constraints to work properly with the parent scroll container
    <div className="h-full bg-slate-900">{renderViewer()}</div>
  )
}

export default DocumentPanel
