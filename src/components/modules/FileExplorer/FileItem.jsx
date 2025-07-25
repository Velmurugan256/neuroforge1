"use client"
import { useState } from "react"
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu"
import { MoreVertical, Download, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { getIcon } from "./treeHelpers"
import { getPresignedDownloadUrl, readFileContent } from "@/api"

const FileItem = ({ item, selectedItem, onSelect, onRename, onDeleteRequest, userId, userRole, onOpenDocument }) => {
  const { name, path } = item
  const extension = name.split(".").pop().toLowerCase()
  const isSelected = selectedItem === path
  
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(name)

  const baseClasses =
    "group cursor-pointer flex justify-between items-center px-3 py-2 rounded-lg transition-all duration-200"
  const activeClasses = isSelected
    ? "bg-cyan-500/10 text-cyan-300"
    : "hover:bg-slate-800/50 text-slate-300 hover:text-slate-100"

  const handleDoubleClick = async () => {
    if (!userId || !userRole) {
      toast.warning("Missing user credentials", { description: "Cannot fetch file." })
      return
    }

    const toastId = toast.loading("Opening file...", { description: name })
    try {
      const content = await readFileContent(path, userId, userRole)
      toast.success("File loaded", { id: toastId, description: name })
      onOpenDocument?.({ name, path, type: extension, content })
    } catch (err) {
      toast.error("Failed to load file content", { id: toastId, description: err.message })
    }
  }

  const handleDownload = async () => {
    if (!userId || !userRole) {
      toast.warning("Missing user credentials", { description: "Cannot download file." })
      return
    }

    const toastId = toast.loading("Preparing download...", { description: name })
    try {
      const downloadUrl = await getPresignedDownloadUrl(path, userId, userRole)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Download started", { id: toastId, description: name })
    } catch (err) {
      toast.error("File download failed", { id: toastId, description: err.message })
    }
  }

  const confirmRename = () => {
    if (!newName.trim() || newName === name) {
      setIsRenaming(false)
      setNewName(name)
      return
    }
    const pathParts = path.split("/")
    pathParts[pathParts.length - 1] = newName
    const newPath = pathParts.join("/")
    onRename(path, newPath)
    setIsRenaming(false)
  }

  return (
    <div onClick={() => !isRenaming && onSelect(path)} onDoubleClick={!isRenaming ? handleDoubleClick : undefined} className={`${baseClasses} ${activeClasses}`}>
      <span className="font-medium flex items-center gap-3 min-w-0 flex-1">
        <span className="text-lg flex-shrink-0">{getIcon(name)}</span>
        {isRenaming ? (
          <input
            className="bg-slate-800/90 text-white border border-cyan-500 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 flex-1 min-w-0"
            value={newName}
            autoFocus
            onChange={(e) => setNewName(e.target.value)}
            onBlur={confirmRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                confirmRename()
              } else if (e.key === "Escape") {
                e.preventDefault()
                setIsRenaming(false)
                setNewName(name)
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate text-sm">{decodeURIComponent(name)}</span>
        )}
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
            setIsRenaming(true)
            setNewName(name)
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
          onClick={() => onDeleteRequest(path, name)}
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
