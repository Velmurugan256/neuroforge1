"use client"
import DocumentPanel from "./DocumentPanel"
import { X } from "lucide-react"
import IconButton from "@/components/ui/IconButton"

const MainViewerPanel = ({ openDocuments, onCloseDocument, activeIndex, setActiveIndex }) => {
  const handleTabClick = (index) => {
    setActiveIndex(index)
  }

  const handleClose = (docToClose) => {
    onCloseDocument(docToClose)
    if (activeIndex >= openDocuments.length - 1) {
      setActiveIndex(Math.max(0, openDocuments.length - 2))
    }
  }

  const activeDocument = openDocuments[activeIndex]

  return (
    <div className="flex flex-col flex-1 h-full bg-slate-950 text-white font-sans text-sm">
      {/* Tab bar */}
      <div className="flex bg-slate-950 border-b border-slate-800/50 overflow-x-auto shadow-lg">
        {openDocuments.map((doc, idx) => {
          const folderPath = doc.path?.split("/").slice(0, -1).join("/") || "/"
          const isActive = idx === activeIndex

          return (
            <div
              key={doc.path}
              className={`flex items-center pl-4 pr-2 py-2.5 cursor-pointer border-r border-slate-800/50 transition-all duration-200 min-w-0 max-w-[220px] group relative
                ${isActive ? "bg-slate-900" : "hover:bg-slate-900/50 text-slate-400 hover:text-slate-200"}
              `}
              onClick={() => handleTabClick(idx)}
              title={doc.path} // ✅ full path tooltip
            >
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_10px_theme(colors.cyan.500)]"></div>
              )}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-lg flex-shrink-0">
                  {doc.type === "txt" ? "📄" : doc.type === "json" ? "🧾" : doc.type === "pdf" ? "📕" : "📁"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`truncate font-medium ${isActive ? "text-white" : "text-slate-300"}`}>{doc.name}</div>
                  <div className="text-xs text-slate-500 truncate">{folderPath}</div>
                </div>
              </div>

              <IconButton
                icon={X}
                onClick={(e) => {
                  e.stopPropagation()
                  handleClose(doc)
                }}
                title="Close Tab"
                variant="ghost"
                size="sm"
                className="ml-2 opacity-0 group-hover:opacity-100 hover:bg-red-600/20 hover:text-red-400"
              />
            </div>
          )
        })}
      </div>

      {/* Active document panel */}
      <div className="flex-1 overflow-hidden bg-slate-950">
        {activeDocument && <DocumentPanel key={activeDocument.path} document={activeDocument} onClose={handleClose} />}
      </div>
    </div>
  )
}

export default MainViewerPanel
