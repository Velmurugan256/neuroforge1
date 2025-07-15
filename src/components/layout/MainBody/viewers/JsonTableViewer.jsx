// --- FILE: viewers/JsonTableViewer.jsx ---
import React from 'react';

const JsonTableViewer = ({ content, filePath }) => {
  let jsonData;

  try {
    jsonData = typeof content === 'string' ? JSON.parse(content) : content;
  } catch (err) {
    return <div className="text-red-500 p-4">Failed to parse JSON: {err.message}</div>;
  }

  if (!Array.isArray(jsonData)) {
    jsonData = [jsonData];
  }

  const columns = Object.keys(jsonData[0] || {});

  return (
    <div className="w-full h-full p-6 bg-gray-900 text-white font-mono text-sm overflow-auto">
      {/* Full file path at the top */}
      {filePath && (
        <div className="text-xs text-blue-400 mb-3 font-semibold border-b border-gray-700 pb-1">
          {filePath}
        </div>
      )}

      <table className="min-w-full table-auto border border-gray-700 sticky top-0 z-10">
        <thead className="bg-gray-800 text-blue-300">
          <tr>
            {columns.map((key) => (
              <th key={key} className="px-4 py-2 border border-gray-700 text-left">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jsonData.map((row, idx) => (
            <tr key={idx} className="even:bg-gray-800 odd:bg-gray-900">
              {columns.map((key) => (
                <td key={key} className="px-4 py-2 border border-gray-800">
                  <span className="text-green-300">
                    {typeof row[key] === 'object'
                      ? JSON.stringify(row[key])
                      : String(row[key])}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JsonTableViewer;
