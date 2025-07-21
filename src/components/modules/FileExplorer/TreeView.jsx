"use client"
import TreeItem from "./TreeItem"

const TreeView = ({
  treeData = [],
  selectedItem,
  onSelect,
  onRename,
  onDelete,
  onCreateFolder,
  onCreateFile, // 🔹 NEW prop
  onUploadFile,
  onRefresh,
  userId,
  userRole,
  onOpenDocument,
}) => (
  <>
    {treeData.length === 0 ? (
      <div className="text-gray-400 italic px-2 py-1">No files or folders found.</div>
    ) : (
      treeData.map((item, idx) => (
        <TreeItem
          key={idx}
          item={item}
          selectedItem={selectedItem}
          onSelect={onSelect}
          onRename={onRename}
          onDelete={onDelete}
          onCreateFolder={onCreateFolder}
          onCreateFile={onCreateFile} // 🔹 Pass down
          onUploadFile={onUploadFile}
          onRefresh={onRefresh}
          userId={userId}
          userRole={userRole}
          onOpenDocument={onOpenDocument}
        />
      ))
    )}
  </>
)

export default TreeView
