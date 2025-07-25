import React from "react"

const TextViewer = ({ content, filePath }) => {
  const lines = content ? content.split("\n") : []

  return (
    <div className="w-full p-6 bg-gray-900 text-white font-mono text-sm">
      <div className="sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10 -mx-6 -mt-6 px-6 py-3 mb-4 border-b border-slate-800">
        <p className="text-sm text-cyan-400 truncate font-semibold">{filePath}</p>
      </div>

      <pre className="grid grid-cols-[auto_1fr] gap-x-4 whitespace-pre-wrap break-words leading-relaxed">
        {lines.map((line, idx) => (
          <React.Fragment key={idx}>
            <span className="text-slate-600 text-right select-none pr-4 border-r border-slate-800">{idx + 1}</span>
            <span className="text-slate-200">{line}</span>
          </React.Fragment>
        ))}
      </pre>
    </div>
  )
}

export default TextViewer
