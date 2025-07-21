"use client"
import { RefreshCw, FolderPlus } from "lucide-react"

const SideNavHeader = ({ onRefresh, loading, onAddFolder, bucketName = "Explorer" }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold flex items-center gap-3 text-slate-200">
        <div className="w-8 h-8 bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-700/50">
          <span className="text-lg">🗂️</span>
        </div>
        {bucketName}
      </h2>

      <div className="flex items-center gap-2">
        <button
          title="Refresh"
          onClick={onRefresh}
          className="group bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 p-2 rounded-lg transition-all duration-200 border border-slate-700/50"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? "animate-spin" : ""} group-hover:scale-110 transition-transform`}
          />
        </button>

        <button
          title="Add Folder"
          onClick={onAddFolder}
          className="group bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 p-2 rounded-lg transition-all duration-200 border border-slate-700/50"
        >
          <FolderPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  </div>
)

export default SideNavHeader
