"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { getS3Tree, createFolder, renameItem as apiRenameItem, deleteItem as apiDeleteItem } from "@/api/files"

const useTreeData = () => {
  const [treeData, setTreeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const injectPaths = (node, parentPath = "") => {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name
    return {
      ...node,
      path: currentPath,
      children: Array.isArray(node.children) ? node.children.map((child) => injectPaths(child, currentPath)) : [],
    }
  }

  const fetchTree = async () => {
    setLoading(true)
    setError(null)
    try {
      const rawTree = await getS3Tree()
      const treeWithPaths = rawTree.map((node) => injectPaths(node, ""))
      setTreeData(treeWithPaths)
    } catch (err) {
      console.error("Failed to fetch S3 tree:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createNewFolder = async (path) => {
    try {
      await createFolder(path)
      toast.success("Folder created", { description: path })
      fetchTree()
    } catch (err) {
      toast.error("Error creating folder", { description: err.message })
    }
  }

  const renamePath = async (oldPath, newPath) => {
    try {
      await apiRenameItem(oldPath, newPath)
      toast.success("Item renamed successfully")
      fetchTree()
    } catch (err) {
      toast.error("Error renaming item", { description: err.message })
    }
  }

  const deletePath = async (path) => {
    try {
      await apiDeleteItem(path)
      toast.success("Item deleted", { description: path })
      fetchTree()
    } catch (err) {
      toast.error("Error deleting item", { description: err.message })
    }
  }

  useEffect(() => {
    fetchTree()
  }, [])

  return {
    treeData,
    loading,
    error,
    fetchTree,
    createNewFolder,
    renameItem: renamePath,
    deleteItem: deletePath,
  }
}

export default useTreeData
