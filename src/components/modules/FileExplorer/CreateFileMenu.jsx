"use client"
import { MenuItem } from "@szhsin/react-menu"
import { FileText } from "lucide-react"

const CreateFileMenu = ({ parentPath, onCreateFile }) => {
  // Shared Tailwind classes for each item
  const itemCls = "text-white hover:bg-slate-800 focus:bg-slate-800 px-3 py-2 flex items-center gap-3 transition-colors"

  return (
    <>
      <MenuItem onClick={() => onCreateFile(parentPath, "json")} className={itemCls}>
        <FileText className="w-4 h-4 text-cyan-400" />
        New .json File...
      </MenuItem>

      <MenuItem onClick={() => onCreateFile(parentPath, "txt")} className={itemCls}>
        <FileText className="w-4 h-4 text-cyan-400" />
        New .txt File...
      </MenuItem>
    </>
  )
}

export default CreateFileMenu
