"use client"

import { useState, useRef } from "react"
import { FilePlus, FolderPlus, Upload, ChevronRight, ChevronDown, Edit, Trash2, MoreVertical } from "lucide-react"
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu"

import CreateFileMenu from "./CreateFileMenu"
import { getIcon } from "./treeHelpers"
import TreeItem from "./TreeItem"

const FolderItem = ({
  item,
  selectedItem,
  onSelect,
  onRename,
  onDeleteRequest,
  onCreateFolder,
  onCreateFile,
  onUploadFile,
  onRefresh,
  userId,
  userRole,
  onOpenDocument,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(item.name)
  const isSelected = selectedItem === item.path

  const fileInputRef = useRef(null)
  const handleUploadClick = () => fileInputRef.current?.click()
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await onUploadFile?.(item.path, file)
    } catch (err) {
      // Error is handled by the parent component's toast
    } finally {
      e.target.value = ""
    }
  }

  const rowBase =
    "group cursor-pointer flex justify-between items-center px-3 py-2 rounded-lg transition-all duration-200"
  const rowActive = isSelected
    ? "bg-cyan-500/10 text-cyan-300"
    : "hover:bg-slate-800/50 text-slate-300 hover:text-slate-100"

  const toggleFolder = () => {
    setIsOpen(!isOpen)
    onSelect(item.path)
  }

  const confirmRename = () => {
    if (!newName.trim() || newName === item.name) {
      setIsRenaming(false)
      setNewName(item.name)
      return
    }
    const pathParts = item.path.split("/")
    pathParts[pathParts.length - 1] = newName
    const newPath = pathParts.join("/")
    onRename(item.path, newPath)
    setIsRenaming(false)
  }

  return (
    <div className="text-white">
      <div className={`${rowBase} ${rowActive}`}>
        {isRenaming ? (
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-lg flex-shrink-0">{getIcon(item.name, true, isOpen)}</span>
            </div>
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
                  setNewName(item.name)
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <div onClick={toggleFolder} className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-lg flex-shrink-0">{getIcon(item.name, true, isOpen)}</span>
            </div>
            <span className="font-medium truncate text-sm">{decodeURIComponent(item.name)}</span>
          </div>
        )}

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Menu
            menuButton={
              <MenuButton
                className="bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white p-1.5 rounded-md transition-all duration-200"
                title="Add File or Folder"
              >
                <FilePlus className="w-4 h-4" />
              </MenuButton>
            }
            direction="bottom"
            align="start"
            portal
            menuClassName="bg-slate-900 border border-slate-800 rounded-lg shadow-xl min-w-[160px]"
          >
            <MenuItem
              onClick={() => onCreateFolder(item.path)}
              className="flex items-center gap-3 px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              New Subfolder...
            </MenuItem>
            <CreateFileMenu parentPath={item.path} onCreateFile={onCreateFile} />
            <MenuItem
              onClick={handleUploadClick}
              className="flex items-center gap-3 px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload file…
            </MenuItem>
          </Menu>

          <Menu
            menuButton={
              <MenuButton
                className="bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white p-1.5 rounded-md transition-all duration-200"
                title="Folder actions"
              >
                <MoreVertical className="w-4 h-4" />
              </MenuButton>
            }
            direction="bottom"
            align="start"
            portal
            menuClassName="bg-slate-900 border border-slate-800 rounded-lg shadow-xl min-w-[160px]"
          >
            <MenuItem
              onClick={() => {
                setIsRenaming(true)
                setNewName(item.name)
              }}
              className="flex items-center gap-3 px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Edit className="w-4 h-4" />
              Rename
            </MenuItem>
            <MenuItem
              onClick={() => onDeleteRequest(item.path, item.name)}
              className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </MenuItem>
          </Menu>
        </div>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelected} />

      {isOpen && (
        <div className="ml-6 mt-2 space-y-1 border-l border-slate-800 pl-4">
          {item.children?.length ? (
            item.children.map((c, i) => (
              <TreeItem
                key={i}
                item={c}
                selectedItem={selectedItem}
                onSelect={onSelect}
                onRename={onRename}
                onDeleteRequest={onDeleteRequest}
                onCreateFolder={onCreateFolder}
                onCreateFile={onCreateFile}
                onUploadFile={onUploadFile}
                onRefresh={onRefresh}
                userId={userId}
                userRole={userRole}
                onOpenDocument={onOpenDocument}
              />
            ))
          ) : (
            <div className="text-slate-500 italic text-sm py-2 px-3">This folder is empty.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default FolderItem
