"use client"

import { useEffect, useState } from "react"
import { getS3Tree, createFolder, renameItem as apiRenameItem, deleteItem as apiDeleteItem } from "@/api"

const useTreeData = () => {
  const [treeData, setTreeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Recursively injects .path into every node, starting from root.
   * Ensures all children inherit correct full S3 path.
   */
  const injectPaths = (node, parentPath = "") => {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name
    const result = {
      ...node,
      path: currentPath,
      children: Array.isArray(node.children) ? node.children.map((child) => injectPaths(child, currentPath)) : [],
    }
    return result
  }

  const fetchTree = async () => {
    setLoading(true)
    setError(null)
    try {
      const rawTree = await getS3Tree()

      // ✅ Inject full S3 paths recursively starting from root
      const treeWithPaths = rawTree.map((node) => injectPaths(node, ""))
      console.log("📦 Final tree with full paths:", treeWithPaths)

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
      fetchTree()
    } catch (err) {
      alert("Error creating folder: " + err.message)
    }
  }

  const renamePath = async (oldPath, newPath) => {
    try {
      await apiRenameItem(oldPath, newPath)
      fetchTree()
    } catch (err) {
      alert("Error renaming item: " + err.message)
    }
  }

  const deletePath = async (path) => {
    const confirm = window.confirm(`Are you sure you want to delete ${path}?`)
    if (!confirm) return
    try {
      await apiDeleteItem(path)
      fetchTree()
    } catch (err) {
      alert("Error deleting item: " + err.message)
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
