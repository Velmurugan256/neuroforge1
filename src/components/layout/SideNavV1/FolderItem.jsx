// --- FILE: FolderItem.jsx ---
import React, { useState, useRef } from 'react';
import { FilePlus, FolderPlus, Upload } from 'lucide-react';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';

import CreateFileMenu from './CreateFileMenu';
import { getIcon } from './treeHelpers';
import TreeItem from './TreeItem';
import { sharedMenuStyles } from '../../../styles/menuStyles'; // adjust path if needed

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
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);

  /* upload helpers */
  const fileInputRef = useRef(null);
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await onUploadFile?.(item.path, file);
      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert('Upload failed ❌');
    } finally {
      e.target.value = '';
    }
  };

  /* helpers */
  const rowBase =
    'cursor-pointer flex justify-between items-center px-2 py-1 rounded';
  const rowActive =
    selectedItem === item.path
      ? 'bg-gray-800 border-l-4 border-blue-500'
      : 'hover:bg-gray-700';

  const confirmRename = () => {
    if (!newName.trim() || newName === item.name) return setIsRenaming(false);
    const newPath = item.path.split('/').slice(0, -1).concat(newName).join('/');
    onRename(item.path, newPath);
    setIsRenaming(false);
  };

  const createSubfolder = () => {
    const fn = prompt('Enter subfolder name:');
    if (fn) onCreateFolder(`${item.path}/${fn}`);
  };

  return (
    <div className="text-white group">
      {/* ── Folder row ───────────────────────────────────────── */}
      <div className={`${rowBase} ${rowActive}`}>
        {/* Folder name or rename input */}
        {isRenaming ? (
          <input
            className="bg-gray-800 text-white border border-blue-400 rounded px-1"
            value={newName}
            autoFocus
            onChange={(e) => setNewName(e.target.value)}
            onBlur={confirmRename}
            onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
          />
        ) : (
          <span
            onClick={() => {
              setIsOpen(!isOpen);
              onSelect(item.path);
            }}
            className="text-white font-semibold"
          >
            {getIcon(item.name, true, isOpen)} {decodeURIComponent(item.name)}
          </span>
        )}

        {/* ── Row action buttons ─────────────────────────────── */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* FILE menu */}
          <Menu
            menuButton={
              <MenuButton
                className="bg-gray-800 text-white p-1 rounded w-8 h-8 flex items-center justify-center hover:bg-gray-700"
                title="Add File"
              >
                <FilePlus className="w-4 h-4" />
              </MenuButton>
            }
            direction="bottom"
            align="start"
            portal
            {...sharedMenuStyles}
          >
            <CreateFileMenu
              parentPath={item.path}
              menuStyles={sharedMenuStyles} // in case CreateFileMenu renders a submenu
            />

            {/* Upload item – icon and text on the same row */}
            <MenuItem
              onClick={handleUploadClick}
              className="flex items-center gap-2 whitespace-nowrap px-3 py-1 hover:bg-gray-700 focus:bg-gray-700"
            >
              <Upload className="w-4 h-4" />
              Upload file…
            </MenuItem>
          </Menu>

          {/* FOLDER menu */}
          <Menu
            menuButton={
              <MenuButton
                className="bg-gray-800 text-white p-1 rounded w-8 h-8 hover:bg-red-600"
                title="Folder actions"
              >
                <FolderPlus className="w-4 h-4" />
              </MenuButton>
            }
            direction="bottom"
            align="start"
            portal
            {...sharedMenuStyles}
          >
            <MenuItem onClick={() => setIsRenaming(true)}>Rename</MenuItem>
            <MenuItem onClick={() => onDelete(item.path)}>Delete</MenuItem>
            <MenuItem onClick={createSubfolder}>Create Subfolder</MenuItem>
          </Menu>
        </div>
      </div>

      {/* Hidden file picker for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* ── Children tree ────────────────────────────────────── */}
      {isOpen && (
        <div className="ml-4 border-l border-gray-700 pl-2">
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
            <div className="text-gray-400 italic text-sm">
              This folder is empty.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FolderItem;
