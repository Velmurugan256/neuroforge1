"use client"

import { useState, useRef } from "react"
import { FilePlus, FolderPlus, Upload, ChevronRight, ChevronDown } from "lucide-react"
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu"

import CreateFileMenu from "./CreateFileMenu"
import { getIcon } from "./treeHelpers"
import TreeItem from "./TreeItem"

const FolderItem = ({
  item,
  selectedItem,
  onSelect,
  onRename,
  onDelete,
  onCreateFolder,
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

  /* upload helpers */
  const fileInputRef = useRef(null)
  const handleUploadClick = () => fileInputRef.current?.click()
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await onUploadFile?.(item.path, file)
      onRefresh?.()
    } catch (err) {
      console.error(err)
      alert("Upload failed ❌")
    } finally {
      e.target.value = ""
    }
  }

  /* helpers */
  const rowBase =
    "group cursor-pointer flex justify-between items-center px-3 py-2 rounded-lg transition-all duration-200"
  const rowActive = isSelected
    ? "bg-cyan-500/10 text-cyan-300"
    : "hover:bg-slate-800/50 text-slate-300 hover:text-slate-100"

  const confirmRename = () => {
    if (!newName.trim() || newName === item.name) return setIsRenaming(false)
    const newPath = item.path.split("/").slice(0, -1).concat(newName).join("/")
    onRename(item.path, newPath)
    setIsRenaming(false)
  }

  const createSubfolder = () => {
    const fn = prompt("Enter subfolder name:")
    if (fn) onCreateFolder(`${item.path}/${fn}`)
  }

  const toggleFolder = () => {
    setIsOpen(!isOpen)
    onSelect(item.path)
  }

  return (
    <div className="text-white">
      {/* ── Folder row ───────────────────────────────────────── */}
      <div className={`${rowBase} ${rowActive}`}>
        {/* Folder name or rename input */}
        {isRenaming ? (
          <input
            className="bg-slate-800 text-white border border-cyan-500 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={newName}
            autoFocus
            onChange={(e) => setNewName(e.target.value)}
            onBlur={confirmRename}
            onKeyDown={(e) => e.key === "Enter" && confirmRename()}
          />
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

        {/* ── Row action buttons ─────────────────────────────── */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* FILE menu */}
          <Menu
            menuButton={
              <MenuButton
                className="bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white p-1.5 rounded-md transition-all duration-200"
                title="Add File"
              >
                <FilePlus className="w-4 h-4" />
              </MenuButton>
            }
            direction="bottom"
            align="start"
            portal
            menuClassName="bg-slate-900 border border-slate-800 rounded-lg shadow-xl min-w-[160px]"
          >
            <CreateFileMenu parentPath={item.path} />

            <MenuItem
              onClick={handleUploadClick}
              className="flex items-center gap-3 px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload file…
            </MenuItem>
          </Menu>

          {/* FOLDER menu */}
          <Menu
            menuButton={
              <MenuButton
                className="bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white p-1.5 rounded-md transition-all duration-200"
                title="Folder actions"
              >
                <FolderPlus className="w-4 h-4" />
              </MenuButton>
            }
            direction="bottom"
            align="start"
            portal
            menuClassName="bg-slate-900 border border-slate-800 rounded-lg shadow-xl min-w-[160px]"
          >
            <MenuItem
              onClick={() => setIsRenaming(true)}
              className="flex items-center gap-3 px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Rename
            </MenuItem>
            <MenuItem
              onClick={() => onDelete(item.path)}
              className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-colors"
            >
              Delete
            </MenuItem>
            <MenuItem
              onClick={createSubfolder}
              className="flex items-center gap-3 px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Create Subfolder
            </MenuItem>
          </Menu>
        </div>
      </div>

      {/* Hidden file picker for uploads */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelected} />

      {/* ── Children tree ────────────────────────────────────── */}
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
                onDelete={onDelete}
                onCreateFolder={onCreateFolder}
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
