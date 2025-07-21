"use client"
import TreeItem from "./TreeItem"

const TreeView = ({
  treeData = [],
  selectedItem,
  onSelect,
  onRename,
  onDelete,
  onCreateFolder,
  onUploadFile, // 🔹 NEW prop
  onRefresh, // 🔹 NEW prop
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

// ✅ Export the TreeView component as the default export of this module
export default TreeView
