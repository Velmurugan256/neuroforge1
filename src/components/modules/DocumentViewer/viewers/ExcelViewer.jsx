"use client"

// --- FILE: viewers/ExcelViewer.jsx ---
import { useEffect, useState } from "react"
import * as XLSX from "xlsx"

const ExcelViewer = ({ fileUrl, filePath }) => {
  const [sheets, setSheets] = useState([]) // All sheet names
  const [activeSheet, setActiveSheet] = useState("") // Current sheet name
  const [data, setData] = useState([]) // Parsed sheet data

  // Parse base64 Excel file
  useEffect(() => {
    try {
      const binary = atob(fileUrl)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }

      const workbook = XLSX.read(bytes, { type: "array" })
      const sheetNames = workbook.SheetNames
      const defaultSheet = sheetNames[0]

      setSheets(sheetNames)
      setActiveSheet(defaultSheet)

      const sheet = workbook.Sheets[defaultSheet]
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      setData(json)
    } catch (error) {
      console.error("Failed to parse Excel file", error)
    }
  }, [fileUrl])

  // Load sheet when user changes selection
  const handleSheetChange = (sheetName) => {
    setActiveSheet(sheetName)
    try {
      const binary = atob(fileUrl)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }

      const workbook = XLSX.read(bytes, { type: "array" })
      const sheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      setData(json)
    } catch (error) {
      console.error("Failed to switch sheet", error)
    }
  }

  const columns = data[0] || []

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white font-mono text-sm">
      {/* Header with file path and sheet selector */}
      <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur-sm p-6 border-b border-gray-700">
        {/* File path */}
        {filePath && (
          <div className="text-xs text-blue-400 mb-3 font-semibold">{filePath}</div>
        )}

        {/* Sheet selector */}
        {sheets.length > 1 && (
          <div>
            <label className="text-gray-400 mr-2">Sheet:</label>
            <select
              value={activeSheet}
              onChange={(e) => handleSheetChange(e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 px-2 py-1 rounded"
            >
              {sheets.map((sheet) => (
                <option key={sheet} value={sheet}>
                  {sheet}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Scrollable Table Content */}
      <div className="flex-1 p-6 overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-700">
          <thead className="bg-gray-800 text-blue-300">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-2 border border-gray-700 text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row, i) => (
              <tr key={i} className="even:bg-gray-800 odd:bg-gray-900">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 border border-gray-800 text-green-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ExcelViewer
