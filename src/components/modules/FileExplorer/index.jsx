"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "sonner"
import { fetchTreeData, createFolder, deleteFileOrFolder, setSelectedItem } from "@/store/slices/fileTreeSlice"
import { createFileWithRefresh, uploadFileWithRefresh, renameFileWithRefresh, renameItemWithRefresh } from "@/store/actions/fileOperations"
import TreeView from "./TreeView"
import Breadcrumb from "./Breadcrumb"
import SideNavHeader from "./SideNavHeader"
import CreateFolderModal from "./CreateFolderModal" 
import CreateFileModal from "./CreateFileModal"
import UploadFileModal from "./UploadFileModal"
import ConfirmationModal from "@/components/ui/ConfirmationModal"

const SideNav = ({ userId, userRole, onOpenDocument, onOpenPlayground }) => {
  const dispatch = useDispatch()
  
  // Get data from Redux store
  const { treeData, loading, error, selectedItem, breadcrumb } = useSelector((state) => state.fileTree)

  // Local modal state
  const [isFolderModalOpen, setFolderModalOpen] = useState(false)
  const [isFileModalOpen, setFileModalOpen] = useState(false)
  const [isUploadModalOpen, setUploadModalOpen] = useState(false)
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false)
  const [modalParentPath, setModalParentPath] = useState("")
  const [modalFileType, setModalFileType] = useState("txt")
  const [confirmModalProps, setConfirmModalProps] = useState({})

  // Load tree data on mount
  useEffect(() => {
    dispatch(fetchTreeData())
  }, [dispatch])

  const handleSelect = (path) => {
    dispatch(setSelectedItem(path))
  }

  // --- Modal Logic ---
  const handleOpenCreateFolderModal = (parentPath = "") => {
    const isFileSelected = selectedItem && selectedItem.includes(".")
    const finalPath = isFileSelected ? selectedItem.split("/").slice(0, -1).join("/") : parentPath
    setModalParentPath(finalPath || "")
    setFolderModalOpen(true)
  }

  const handleConfirmCreateFolder = (newFolderName) => {
    const fullPath = modalParentPath ? `${modalParentPath}/${newFolderName}` : newFolderName
    dispatch(createFolder({ path: fullPath, userId, userRole }))
  }

  const handleOpenCreateFileModal = (parentPath, fileType) => {
    setModalParentPath(parentPath || "")
    setModalFileType(fileType)
    setFileModalOpen(true)
  }

  const handleConfirmCreateFile = async (newFileName) => {
    const fullPath = `${modalParentPath}/${newFileName}.${modalFileType}`
    try {
      await dispatch(createFileWithRefresh({ path: fullPath, userId, userRole })).unwrap()
      toast.success("File created", { description: fullPath })
    } catch (err) {
      toast.error("Failed to create file", { description: err.message })
    }
  }

  const handleOpenDeleteConfirm = (path, name) => {
    setConfirmModalProps({
      title: "Delete Item",
      message: `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`,
      confirmText: "Delete",
      onConfirm: () => dispatch(deleteFileOrFolder({ path, userId, userRole })),
    })
    setConfirmModalOpen(true)
  }

  // --- Upload Logic ---
  const handleOpenUploadModal = (folderPath) => {
    setModalParentPath(folderPath || "")
    setUploadModalOpen(true)
  }

  const handleUploadFile = async (folderPath, file) => {
    const toastId = toast.loading("Uploading file...", { description: file.name })
    try {
      await dispatch(uploadFileWithRefresh({ parentPath: folderPath, file, userId, userRole })).unwrap()
      toast.success("Upload successful", { id: toastId, description: file.name })
    } catch (err) {
      toast.error("Upload failed", { id: toastId, description: err.message })
    }
  }

  // --- Rename Logic ---
  const handleRename = async (oldPath, newPath) => {
    try {
      // Determine if it's a file or folder (consistent with useTreeData.js)
      const isFile = oldPath.includes('.') && !oldPath.endsWith('/')
      
      if (isFile) {
        // Use renameFile for files (requires user credentials)
        await dispatch(renameFileWithRefresh({ oldPath, newPath, userId, userRole })).unwrap()
      } else {
        // Use renameItem for folders (no user credentials needed)
        await dispatch(renameItemWithRefresh({ oldPath, newPath })).unwrap()
      }
      
      toast.success("Renamed successfully")
    } catch (err) {
      toast.error("Rename failed", { description: err.message })
    }
  }

  return (
    <>
      <div className="h-full flex flex-col bg-slate-950 text-white border-r border-slate-800/50 min-h-0">
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent hover:scrollbar-thumb-slate-600 min-h-0">
          <SideNavHeader
            onRefresh={() => dispatch(fetchTreeData())}
            loading={loading}
            onAddFolder={() => handleOpenCreateFolderModal(selectedItem || "")}
            onOpenPlayground={onOpenPlayground}
            bucketName="Explorer"
          />

          <Breadcrumb pathArray={breadcrumb} />

          {loading && (
            <div className="text-slate-400 px-3 py-2 text-sm flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              Loading folders…
            </div>
          )}
          {error && (
            <div className="text-red-400 px-3 py-2 text-sm bg-red-500/10 rounded-lg border border-red-500/20">
              Error: {error}
            </div>
          )}

          {!loading && !error && (
            <TreeView
              treeData={treeData}
              selectedItem={selectedItem}
              onSelect={handleSelect}
              onRename={handleRename}
              onDeleteRequest={handleOpenDeleteConfirm}
              onCreateFolder={handleOpenCreateFolderModal}
              onCreateFile={handleOpenCreateFileModal}
              onUploadFile={handleOpenUploadModal}
              onRefresh={() => dispatch(fetchTreeData())}
              userId={userId}
              userRole={userRole}
              onOpenDocument={onOpenDocument}
            />
          )}
        </div>
      </div>

      {/* Render Modals */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        onSubmit={handleConfirmCreateFolder}
        parentPath={modalParentPath}
      />
      <CreateFileModal
        isOpen={isFileModalOpen}
        onClose={() => setFileModalOpen(false)}
        onSubmit={handleConfirmCreateFile}
        parentPath={modalParentPath}
        fileType={modalFileType}
      />
      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmit={handleUploadFile}
        parentPath={modalParentPath}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        {...confirmModalProps}
      />
    </>
  )
}

export default SideNav
