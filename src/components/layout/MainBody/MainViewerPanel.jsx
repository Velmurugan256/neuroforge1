// --- FILE: layout/MainBody/MainViewerPanel.jsx ---
import React from "react";
import DocumentPanel from "./DocumentPanel";
import { X } from "lucide-react";
import IconButton from "../../ui/IconButton";

const MainViewerPanel = ({
  openDocuments,
  onCloseDocument,
  activeIndex,
  setActiveIndex,
}) => {
  const handleTabClick = (index) => {
    setActiveIndex(index);
  };

  const handleClose = (docToClose) => {
    onCloseDocument(docToClose);
    if (activeIndex >= openDocuments.length - 1) {
      setActiveIndex(Math.max(0, openDocuments.length - 2));
    }
  };

  const activeDocument = openDocuments[activeIndex];

  return (
    <div className="flex flex-col flex-1 h-full bg-gray-900 text-white font-mono text-sm">
      {/* Tab bar */}
      <div className="flex bg-[#1e1e1e] border-b border-gray-700 px-2 overflow-x-auto">
        {openDocuments.map((doc, idx) => {
          const folderPath = doc.path?.split('/').slice(0, -1).join('/') || '/';
          return (
            <div
              key={doc.path}
              className={`flex items-center px-4 py-2 cursor-pointer border-r border-gray-700
                ${idx === activeIndex ? "bg-gray-800 font-semibold" : "hover:bg-gray-700 text-gray-400"}
              `}
              onClick={() => handleTabClick(idx)}
              title={doc.path} // ✅ full path tooltip
            >
              <span className="truncate max-w-[150px]">
                {doc.name}
                <span className="text-gray-500 text-xs ml-1">
                  ({folderPath})
                </span>
              </span>

              <IconButton
                icon={X}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose(doc);
                }}
                title="Close Tab"
                variant="danger"
                size="sm"
                className="ml-2"
              />
            </div>
          );
        })}
      </div>

      {/* Active document panel */}
      <div className="flex-1 overflow-hidden bg-gray-900">
        {activeDocument && (
          <DocumentPanel
            key={activeDocument.path}
            document={activeDocument}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
};

export default MainViewerPanel;
