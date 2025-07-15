// components/content/TextEditor.jsx
import React from "react";

const TextEditor = ({ fileKey, content, onClose }) => {
  return (
    <div className="p-4 bg-white border rounded shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold truncate text-black">{fileKey}</h2>
        <button onClick={onClose} className="text-sm text-blue-500 underline">
          Close
        </button>
      </div>
      <pre className="flex-1 overflow-auto bg-white text-black p-4 border rounded text-sm font-mono whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  );
};

export default TextEditor;