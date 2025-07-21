"use client"
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu"
import { MoreVertical, Download, Edit, Trash2 } from "lucide-react"
import { getIcon } from "./treeHelpers"
import { getPresignedDownloadUrl, readFileContent } from "@/api"

const FileItem = ({ item, selectedItem, onSelect, onRename, onDelete, userId, userRole, onOpenDocument }) => {
  const { name, path } = item
  const extension = name.split(".").pop().toLowerCase()
  const isSelected = selectedItem === path

  const baseClasses =
    "group cursor-pointer flex justify-between items-center px-3 py-2 rounded-lg transition-all duration-200"
  const activeClasses = isSelected
    ? "bg-cyan-500/10 text-cyan-300"
    : "hover:bg-slate-800/50 text-slate-300 hover:text-slate-100"

  // Handle double-click to open file
  const handleDoubleClick = async () => {
    if (!userId || !userRole) {
      alert("⚠️ Missing user credentials. Cannot fetch file.")
      return
    }

    try {
      const content = await readFileContent(path, userId, userRole)

      if (!content || content.trim() === "") {
        console.warn("📂 File is empty:", name)
      }

      onOpenDocument?.({
        name,
        path,
        type: extension,
        content,
      })
    } catch (err) {
      console.error("❌ File read failed:", err)
      alert("❌ Failed to load file content.")
    }
  }

  // Handle download
  const handleDownload = async () => {
    if (!userId || !userRole) {
      alert("⚠️ Missing user credentials. Cannot download file.")
      return
    }

    try {
      const downloadUrl = await getPresignedDownloadUrl(path, userId, userRole)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("❌ Download failed:", err)
      alert("❌ File download failed.")
    }
  }

  return (
    <div onClick={() => onSelect(path)} onDoubleClick={handleDoubleClick} className={`${baseClasses} ${activeClasses}`}>
      <span className="font-medium flex items-center gap-3 min-w-0">
        <span className="text-lg flex-shrink-0">{getIcon(name)}</span>
        <span className="truncate text-sm">{decodeURIComponent(name)}</span>
      </span>

      <Menu
        menuButton={
          <MenuButton className="opacity-0 group-hover:opacity-100 bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white p-1.5 rounded-md transition-all duration-200 flex-shrink-0">
            <MoreVertical className="w-4 h-4" />
          </MenuButton>
        }
        menuClassName="bg-slate-900 border border-slate-800 rounded-lg shadow-xl min-w-[160px]"
      >
        <MenuItem
          onClick={() => {
            const newName = prompt("New file name:", name)
            if (newName && path) {
              const newPath = path.split("/").slice(0, -1).concat(newName).join("/")
              onRename(path, newPath)
            }
          }}
          className="flex items-center gap-3 px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Edit className="w-4 h-4" />
          Rename
        </MenuItem>

        <MenuItem
          onClick={handleDownload}
          className="flex items-center gap-3 px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </MenuItem>

        <MenuItem
          onClick={() => onDelete(path)}
          className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </MenuItem>
      </Menu>
    </div>
  )
}

export default FileItem
