const JsonTableViewer = ({ content, filePath }) => {
  let jsonData

  try {
    jsonData = typeof content === "string" ? JSON.parse(content) : content
  } catch (err) {
    return (
      <div className="p-6">
        <div className="text-red-500">Failed to parse JSON: {err.message}</div>
      </div>
    )
  }

  if (!jsonData || (Array.isArray(jsonData) && jsonData.length === 0)) {
    return (
      <div className="w-full p-6 bg-gray-900 text-white font-mono text-sm">
        <div className="sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10 -mx-6 -mt-6 px-6 py-3 mb-4 border-b border-slate-800">
          <p className="text-sm text-cyan-400 truncate font-semibold">{filePath}</p>
        </div>
        <div className="text-slate-500 p-4">JSON file is empty or contains no data.</div>
      </div>
    )
  }

  if (!Array.isArray(jsonData)) {
    jsonData = [jsonData]
  }

  const columns = Object.keys(jsonData[0] || {})

  return (
    <div className="w-full p-6 bg-gray-900 text-white font-mono text-sm">
      <div className="sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10 -mx-6 -mt-6 px-6 py-3 mb-4 border-b border-slate-800">
        <p className="text-sm text-cyan-400 truncate font-semibold">{filePath}</p>
      </div>

      <table className="min-w-full table-auto border-collapse">
        <thead className="bg-slate-800 text-slate-300">
          <tr>
            {columns.map((key) => (
              <th key={key} className="px-4 py-2 border border-slate-700 text-left font-semibold">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jsonData.map((row, idx) => (
            <tr key={idx} className="bg-slate-900 hover:bg-slate-800/50 transition-colors duration-150">
              {columns.map((key) => (
                <td key={key} className="px-4 py-2 border border-slate-800 align-top">
                  <span className="text-slate-200">
                    {typeof row[key] === "object" ? JSON.stringify(row[key], null, 2) : String(row[key])}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default JsonTableViewer
