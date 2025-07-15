// ── FILE: src/components/layout/SideNavV1/SideNav.jsx ──
import React, { useState } from "react";
import useTreeData from "./useTreeData";
import TreeView from "./TreeView";
import Breadcrumb from "./Breadcrumb";
import SideNavHeader from "./SideNavHeader";
import { uploadFile } from "../../common/api";

/**
 * Props
 * ─────
 * userId        – current user (for uploads)
 * userRole      – role (for uploads / permission checks)
 * onOpenDocument(path) – callback when a file is double-clicked
 */
const SideNav = ({ userId, userRole, onOpenDocument }) => {
  /* ---------- tree state & helpers ---------- */
  const {
    treeData,
    loading,
    error,
    fetchTree,
    createNewFolder,  // <- comes from your hook
    renameItem,
    deleteItem,
  } = useTreeData();

  /* ---------- selection & breadcrumb state ---------- */
  const [selectedItem, setSelectedItem] = useState(null);
  const [breadcrumb, setBreadcrumb]   = useState([]);

  const handleSelect = (path) => {
    if (!path) return;
    setSelectedItem(path);
    setBreadcrumb(path.split("/").filter(Boolean));
  };

const handleAddFolder = async () => {
  const name = prompt("New folder name:");
  if (!name) return;

  // Handle root correctly: empty string "" is valid, "None"/null causes 403
  const parentPath = selectedItem && !selectedItem.includes(".")
    ? selectedItem
    : "";

  const fullPath = parentPath ? `${parentPath}/${name}` : name;

  try {
    await createNewFolder(fullPath);  // ✅ calls backend with path = "" or "parent"
    fetchTree();                      // refresh explorer
  } catch (err) {
    alert(`Error creating folder: ❌ ${err.message}`);
    console.error(err);
  }
};

  /* ---------- file upload (already working) ---------- */
  const handleUploadFile = async (folderPath, file) => {
    try {
      await uploadFile(folderPath, file, userId, userRole);
      fetchTree();
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  return (
    <div className="w-85 h-full bg-gray-900 text-white shadow-lg p-2 overflow-y-scroll
                    scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
      {/* Explorer / bucket header */}
      <SideNavHeader
        onRefresh={fetchTree}
        loading={loading}
        onAddFolder={handleAddFolder}     /* <-- wired! */
        bucketName="Explorer"            /* change to env var later */
      />

      {/* Breadcrumb */}
      <Breadcrumb pathArray={breadcrumb} />

      {/* Status messages */}
      {loading && (
        <div className="text-gray-400 px-2 py-1">Loading folders…</div>
      )}
      {error && (
        <div className="text-red-400 px-2 py-1">Error: {error}</div>
      )}

      {/* Tree view */}
      {!loading && !error && (
        <TreeView
          treeData={treeData}
          selectedItem={selectedItem}
          onSelect={handleSelect}
          /* CRUD */
          onRename={renameItem}
          onDelete={deleteItem}
          onCreateFolder={createNewFolder}       /* context-menu support */
          onUploadFile={handleUploadFile}
          onRefresh={fetchTree}
          /* misc */
          userId={userId}
          userRole={userRole}
          onOpenDocument={onOpenDocument}
        />
      )}
    </div>
  );
};

export default SideNav;
