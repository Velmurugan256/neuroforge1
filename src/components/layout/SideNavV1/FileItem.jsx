// --- FILE: FileItem.jsx ---
import React from 'react';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import { getIcon } from './treeHelpers';
import { getPresignedDownloadUrl, readFileContent } from '../../common/api.js';

const FileItem = ({
  item,
  selectedItem,
  onSelect,
  onRename,
  onDelete,
  userId,
  userRole,
  onOpenDocument
}) => {
  const { name, path } = item;
  const extension = name.split('.').pop().toLowerCase();

  const baseClasses = 'cursor-pointer flex justify-between items-center px-2 py-1 rounded';
  const activeClasses = selectedItem === path
    ? 'bg-gray-800 border-l-4 border-blue-500'
    : 'hover:bg-gray-700';

  // Handle double-click to open file
  const handleDoubleClick = async () => {
    if (!userId || !userRole) {
      alert("⚠️ Missing user credentials. Cannot fetch file.");
      return;
    }

    try {
      const content = await readFileContent(path, userId, userRole);

      if (!content || content.trim() === "") {
        console.warn("📂 File is empty:", name);
      }

      onOpenDocument?.({
        name,
        path,
        type: extension,
        content
      });
    } catch (err) {
      console.error("❌ File read failed:", err);
      alert("❌ Failed to load file content.");
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (!userId || !userRole) {
      alert("⚠️ Missing user credentials. Cannot download file.");
      return;
    }

    try {
      const downloadUrl = await getPresignedDownloadUrl(path, userId, userRole);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("❌ Download failed:", err);
      alert("❌ File download failed.");
    }
  };

  return (
    <div
      onClick={() => onSelect(path)}
      onDoubleClick={handleDoubleClick}
      className={`${baseClasses} ${activeClasses} group px-4`}
    >
      <span className="text-white font-mono">
        {getIcon(name)} {decodeURIComponent(name)}
      </span>

      <Menu
        menuButton={
          <MenuButton className="bg-gray-800 text-white p-1 rounded w-8 h-8 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
            ⋮
          </MenuButton>
        }
      >
        <MenuItem onClick={() => {
          const newName = prompt('New file name:', name);
          if (newName && path) {
            const newPath = path.split('/').slice(0, -1).concat(newName).join('/');
            onRename(path, newPath);
          }
        }}>Rename</MenuItem>

        <MenuItem onClick={handleDownload}>Download</MenuItem>

        <MenuItem onClick={() => onDelete(path)}>Delete</MenuItem>
      </Menu>
    </div>
  );
};

export default FileItem;
