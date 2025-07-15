import React, { useState } from 'react';
import { Resizable } from 're-resizable';
import HeaderBar from './components/layout/HeaderBar.jsx';
import SideNavPanel from './components/layout/SideNavV1/SideNav.jsx';
import MainViewerPanel from './components/layout/MainBody/MainViewerPanel.jsx';
import RightPanelContainer from './components/layout/Rightpanel/RightPanelContainer.jsx';
import { Toaster } from "@/components/ui/sonner";
function App() {
  const currentUser = {
    id: 'vmarimuthu',
    role: 'admin'
  };

  const [openDocuments, setOpenDocuments] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sideNavWidth, setSideNavWidth] = useState(240);
  const [rightPanelWidth, setRightPanelWidth] = useState(256);

  const openDocument = (doc) => {
    const alreadyOpenIndex = openDocuments.findIndex((d) => d.name === doc.name);
    if (alreadyOpenIndex !== -1) {
      setActiveIndex(alreadyOpenIndex);
    } else {
      setOpenDocuments((prev) => [...prev, doc]);
      setActiveIndex(openDocuments.length);
    }
  };

  const closeDocument = (docToClose) => {
    setOpenDocuments((prev) => {
      const updated = prev.filter((doc) => doc.name !== docToClose.name);
      if (activeIndex >= updated.length) {
        setActiveIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white font-mono flex flex-col">
      <HeaderBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Resizable SideNav */}
        <Resizable
          size={{ width: sideNavWidth, height: '100%' }}
          onResizeStop={(e, direction, ref, d) => {
            setSideNavWidth(sideNavWidth + d.width);
          }}
          minWidth={180}
          maxWidth={400}
          enable={{ right: true }}
          className="bg-gray-900 border-r border-gray-700"
        >
          <SideNavPanel
            userId={currentUser.id}
            userRole={currentUser.role}
            onOpenDocument={openDocument}
          />
        </Resizable>

        {/* Center */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {openDocuments.length > 0 ? (
            <MainViewerPanel
              openDocuments={openDocuments}
              onCloseDocument={closeDocument}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />
          ) : (
            <main className="p-4 overflow-y-auto bg-gray-900 h-full">
              <h1 className="text-3xl font-bold mb-4 text-white">🧪 Test Render</h1>
              <p className="text-gray-400">Select a file from the Explorer to begin.</p>
            </main>
          )}
        </div>

        {/* Resizable Right Panel */}
        <Resizable
          size={{ width: rightPanelWidth, height: '100%' }}
          onResizeStop={(e, direction, ref, d) => {
            setRightPanelWidth(rightPanelWidth + d.width);
          }}
          minWidth={200}
          maxWidth={400}
          enable={{ left: true }}
          className="bg-gray-800 border-l border-gray-700"
        >
          <RightPanelContainer />
        </Resizable>
      </div>
    </div>
  );
}

export default App;
