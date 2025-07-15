// --- FILE: viewers/TextViewer.jsx ---
import React from 'react';

const TextViewer = ({ content, filePath }) => {
  const lines = content.split('\n');

  return (
    <div className="w-full h-full p-6 bg-gray-900 text-white font-mono text-sm overflow-auto">
      {/* File path only (NO name) */}
      {filePath && (
        <div className="text-xs text-blue-400 mb-3 font-semibold border-b border-gray-700 pb-1">
          {filePath}
        </div>
      )}

      {/* Line-numbered content */}
      <pre className="grid grid-cols-[3em_1fr] gap-x-4 whitespace-pre-wrap break-words leading-relaxed">
        {lines.map((line, idx) => (
          <React.Fragment key={idx}>
            <span className="text-gray-600 text-right select-none">{idx + 1}</span>
            <span>{line}</span>
          </React.Fragment>
        ))}
      </pre>
    </div>
  );
};

export default TextViewer;
