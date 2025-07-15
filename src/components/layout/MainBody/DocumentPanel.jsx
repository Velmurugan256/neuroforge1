// --- FILE: layout/MainBody/DocumentPanel.jsx ---
import React from "react";
import { X } from "lucide-react";
import TextViewer from "./viewers/TextViewer";
import JsonTableViewer from "./viewers/JsonTableViewer";
import PdfViewer from "./viewers/PdfViewer";
import DocxViewer from "./viewers/DocxViewer";
import ExcelViewer from "./viewers/ExcelViewer";
import IconButton from "../../ui/IconButton";

const DocumentPanel = ({ document, onClose }) => {
  const { name, path, type, content } = document;

  const getIcon = () => {
    switch (type) {
      case "txt": return "📄";
      case "json": return "🧾";
      case "pdf": return "📎";
      case "docx": return "📃";
      case "xlsx":
      case "xls": return "📊";
      default: return "📁";
    }
  };

  const renderViewer = () => {
    switch (type) {
      case "txt":
        return <TextViewer content={content} filePath={path} />;
      case "json":
        return <JsonTableViewer content={content} filePath={path} />;
      case "pdf":
        return <PdfViewer fileUrl={content} filePath={path} />;
      case "docx":
        return <DocxViewer fileUrl={content} filePath={path} />;
      case "xlsx":
      case "xls":
        return <ExcelViewer fileUrl={content} filePath={path} />;
      default:
        return (
          <div className="p-4 text-white">
            Unsupported file type: {type}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white shadow-sm">
      {/* Single Tab Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-[#1e1e1e] font-mono text-sm text-white">
        <span className="truncate flex items-center gap-2">
          <span>{getIcon()}</span>
          {name}
        </span>

        {/* ✅ New reusable close button */}
        <IconButton
          icon={X}
          onClick={() => onClose(document)}
          title="Close"
          variant="danger"
          size="md"
        />
      </div>

      {/* Viewer content */}
      <div className="flex-1 overflow-auto bg-gray-900">
        {renderViewer()}
      </div>
    </div>
  );
};

export default DocumentPanel;
