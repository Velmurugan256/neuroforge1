"use client"
import DocumentPanel from "./DocumentPanel"
import { X } from "lucide-react"
import IconButton from "@/components/ui/IconButton"
import { getFileIcon } from "@/lib/file-icons"

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

  // --- Tab Styling ---
  const tabBaseClasses =
    "flex items-center pl-4 pr-2 py-2.5 cursor-pointer border-r transition-colors duration-200 min-w-0 max-w-[220px] group relative flex-shrink-0"
  const inactiveTabClasses = "border-slate-800/50 bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
  const activeTabClasses = "border-slate-800/50 border-b-transparent bg-slate-900 text-white"

  return (
    <div className="flex flex-col flex-1 h-full bg-slate-950 text-white font-sans text-sm min-h-0">
      {/* Tab bar */}
      <div className="flex-shrink-0 bg-slate-950 border-b border-slate-800/50 shadow-sm">
        <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {openDocuments.map((doc, idx) => {
            const isActive = idx === activeIndex
            const isPlayground = doc.type === "playground"
            const folderPath = isPlayground ? "AI Assistant" : (doc.path?.split("/").slice(0, -1).join("/") || "/")
            const displayIcon = isPlayground ? "🤖" : getFileIcon(doc.name)
            
            // Special styling for playground tab
            const playgroundActiveClasses = isPlayground && isActive 
              ? "border-slate-800/50 border-b-transparent bg-slate-900 text-white shadow-lg shadow-cyan-500/10" 
              : ""
            const finalTabClasses = isPlayground && isActive 
              ? `${tabBaseClasses} ${playgroundActiveClasses}`
              : `${tabBaseClasses} ${isActive ? activeTabClasses : inactiveTabClasses}`
            
            return (
              <div
                key={doc.path}
                className={finalTabClasses}
                onClick={() => handleTabClick(idx)}
                title={isPlayground ? "AI Playground - Interactive Chat Assistant" : doc.path}
              >
                {isPlayground && isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_10px_theme(colors.cyan.500)]"></div>
                )}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-lg flex-shrink-0">{displayIcon}</span>
                  <div className="min-w-0 flex-1">
                    <div className={`truncate font-medium ${isActive ? "text-white" : "text-slate-300"}`}>
                      {doc.name}
                    </div>
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
      </div>

      {/* Active document panel - THIS IS NOW THE SCROLL CONTAINER */}
      <div className="flex-1 overflow-y-auto bg-slate-900 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent min-h-0">
        {activeDocument && <DocumentPanel key={activeDocument.path} document={activeDocument} onClose={handleClose} />}
      </div>
    </div>
  )
}

export default MainViewerPanel
