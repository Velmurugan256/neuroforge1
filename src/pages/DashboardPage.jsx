"use client"

import { useState } from "react"
import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from "@/components/ui/resizable"
import HeaderBar from "../components/layout/HeaderBar.jsx"
import SideNavPanel from "../components/modules/FileExplorer/index.jsx"
import MainViewerPanel from "../components/modules/DocumentViewer/index.jsx"
import RightPanelContainer from "../components/modules/IngestionDashboard/index.jsx"
import Footer from "../components/layout/Footer.jsx"
import MobileNav from "../components/layout/MobileNav.jsx"
import { useAuth } from "@/context/AuthContext.jsx"
import { useMediaQuery } from "@/hooks/useMediaQuery.js"

function DashboardPage() {
  const { user } = useAuth()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const userId = user?.["cognito:username"] || user?.email || "unknown-user"
  const userRole = user?.["cognito:groups"]?.[0] || "user"

  const [openDocuments, setOpenDocuments] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [activePanel, setActivePanel] = useState("explorer")

  const openDocument = (doc) => {
    const alreadyOpenIndex = openDocuments.findIndex((d) => d.name === doc.name)
    if (alreadyOpenIndex !== -1) {
      setActiveIndex(alreadyOpenIndex)
    } else {
      setOpenDocuments((prev) => [...prev, doc])
      setActiveIndex(openDocuments.length)
    }
    // Switch to viewer panel on mobile when a doc is opened
    if (isMobile) {
      setActivePanel("viewer")
    }
  }

  const closeDocument = (docToClose) => {
    setOpenDocuments((prev) => {
      const updated = prev.filter((doc) => doc.name !== docToClose.name)
      if (activeIndex >= updated.length) {
        setActiveIndex(Math.max(0, updated.length - 1))
      }
      return updated
    })
  }

  const renderDesktopLayout = () => (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={18} minSize={15} maxSize={25}>
        <SideNavPanel userId={userId} userRole={userRole} onOpenDocument={openDocument} />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={60}>
        <MainContent />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={22} minSize={18} maxSize={30}>
        <RightPanelContainer />
      </ResizablePanel>
    </ResizablePanelGroup>
  )

  const renderMobileLayout = () => (
    <div className="h-full pb-16">
      {activePanel === "explorer" && <SideNavPanel userId={userId} userRole={userRole} onOpenDocument={openDocument} />}
      {activePanel === "viewer" && <MainContent />}
      {activePanel === "stats" && <RightPanelContainer />}
      <MobileNav activePanel={activePanel} setActivePanel={setActivePanel} />
    </div>
  )

  const MainContent = () => (
    <div className="flex-1 min-w-0 overflow-hidden h-full">
      {openDocuments.length > 0 ? (
        <MainViewerPanel
          openDocuments={openDocuments}
          onCloseDocument={closeDocument}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />
      ) : (
        <div className="p-8 overflow-y-auto bg-slate-950 h-full flex items-center justify-center">
          <div className="text-center max-w-md animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/20">
              <span className="text-4xl">🧠</span>
            </div>
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Welcome to NeuroForge
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Select a file from the Explorer to begin working with your documents.
            </p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
      <HeaderBar />
      <main className="flex-1 overflow-hidden">{isMobile ? renderMobileLayout() : renderDesktopLayout()}</main>
      {!isMobile && <Footer />}
    </div>
  )
}

export default DashboardPage
