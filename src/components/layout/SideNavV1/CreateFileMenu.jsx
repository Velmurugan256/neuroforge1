// components/file/CreateFileMenu.jsx
import React from 'react';
import { MenuItem } from '@szhsin/react-menu';
import { FileText } from 'lucide-react';
import { createFile } from '../../common/api';

const CreateFileMenu = ({ parentPath, refreshTree }) => {
  const handleCreate = async (extension) => {
    const baseName = prompt(`Enter ${extension} file name (without extension):`);
    if (!baseName) return;

    const fileName = `${baseName.trim()}.${extension}`;
    const fullPath = `${parentPath}/${fileName}`;

    try {
      await createFile(fullPath);
      refreshTree?.();            // optional refresh
    } catch (err) {
      alert(`Failed to create file: ${err.message}`);
    }
  };

  // shared Tailwind classes for each item
  const itemCls =
    'text-white hover:bg-gray-700 focus:bg-gray-700 px-3 py-1 flex items-center gap-2';

  return (
    <>
      <MenuItem onClick={() => handleCreate('json')} className={itemCls}>
        <FileText className="w-4 h-4" />
        New .json File
      </MenuItem>

      <MenuItem onClick={() => handleCreate('txt')} className={itemCls}>
        <FileText className="w-4 h-4" />
        New .txt File
      </MenuItem>
    </>
  );
};

export default CreateFileMenu;
