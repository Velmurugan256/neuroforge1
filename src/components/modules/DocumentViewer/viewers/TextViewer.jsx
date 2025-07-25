import React from "react"

const TextViewer = ({ content, filePath }) => {
  const lines = content ? content.split("\n") : []

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white font-mono text-sm">
      {/* Sticky Header */}
      <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur-sm px-6 py-3 border-b border-slate-800">
        <p className="text-sm text-cyan-400 truncate font-semibold">{filePath}</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <pre className="grid grid-cols-[auto_1fr] gap-x-4 whitespace-pre-wrap break-words leading-relaxed">
          {lines.map((line, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-600 text-right select-none pr-4 border-r border-slate-800">{idx + 1}</span>
              <span className="text-slate-200">{line}</span>
            </React.Fragment>
          ))}
        </pre>
      </div>
    </div>
  )
}

export default TextViewer
