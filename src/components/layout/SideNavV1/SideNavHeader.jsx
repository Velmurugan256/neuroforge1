// src/components/layout/SideNavV1/SideNavHeader.jsx
import React from "react";
import { RefreshCw, FolderPlus } from "lucide-react";

const SideNavHeader = ({ onRefresh, loading, onAddFolder, bucketName = "Explorer" }) => (
  <div className="flex items-center justify-between mb-2 border-b border-gray-700 pb-1">
    <h2 className="text-lg font-bold flex items-center gap-2">📂 {bucketName}</h2>
    <div className="flex items-center gap-2">
      <button title="Refresh" onClick={onRefresh}
        className="bg-gray-800 text-white p-1 rounded w-8 h-8 flex items-center justify-center hover:bg-blue-600">
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      </button>

      {/* This button will trigger our handler below */}
      <button title="Add Folder" onClick={onAddFolder}
        className="bg-gray-800 text-white p-1 rounded w-8 h-8 flex items-center justify-center hover:bg-green-600">
        <FolderPlus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default SideNavHeader;
