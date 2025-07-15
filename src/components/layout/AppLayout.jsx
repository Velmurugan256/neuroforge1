// components/layout/AppLayout.jsx
import { useState } from 'react';
import { Resizable } from 're-resizable';
import HeaderBar from './HeaderBar.jsx';
import SideNav from './SideNav.jsx';
import ActionToolbar from '../controls/ActionToolbar.jsx';
import FileViewer from '../content/FileViewer.jsx';

const AppLayout = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white font-mono">
      <Resizable
        defaultSize={{ width: 500, height: '100%' }}
        minWidth={280}
        maxWidth={1000}
        enable={{ right: true }}
        handleClasses={{ right: 'resizer-handle' }}
        className="bg-gray-900 shadow-lg"
      >
        <SideNav onSelectFile={setSelectedFile} />
      </Resizable>

      <div className="flex flex-col flex-1 overflow-hidden">
        <HeaderBar />
        <div className="border-b border-gray-700 px-4 py-2">
          <ActionToolbar file={selectedFile} />
        </div>
        {selectedFile && (
          <div className="bg-[#1e1e1e] px-4 py-2 border-b border-gray-800 text-xs text-gray-400">
            {selectedFile.path.join(' > ')}
          </div>
        )}
        <FileViewer file={selectedFile} />
      </div>
    </div>
  );
};

export default AppLayout;
