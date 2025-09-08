"use client"

import { useState } from "react"
import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from "@/components/ui/resizable"
import HeaderBar from "../components/layout/HeaderBar.jsx"
import SideNavPanel from "../components/modules/FileExplorer/index.jsx"
import MainViewerPanel from "../components/modules/DocumentViewer/index.jsx"
import RightPanelContainer from "../components/modules/IngestionDashboard/index.jsx"
import Footer from "../components/layout/Footer.jsx"
import MobileNav from "../components/layout/MobileNav.jsx"
import PlaygroundButton from "../components/modules/ChatPlayground/PlaygroundButton.jsx"
import { useAuth } from "@/context/AuthContext.jsx"
import { useMediaQuery } from "@/hooks/useMediaQuery.js"
import Loader from "../components/ui/Loader.jsx"

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

  const openPlayground = () => {
    const playgroundDoc = {
      name: "AI Playground",
      path: "playground://ai-chat",
      type: "playground",
      content: null,
      isSpecial: true
    }
    
    const alreadyOpenIndex = openDocuments.findIndex((d) => d.type === "playground")
    if (alreadyOpenIndex !== -1) {
      setActiveIndex(alreadyOpenIndex)
    } else {
      setOpenDocuments((prev) => [...prev, playgroundDoc])
      setActiveIndex(openDocuments.length)
    }
    // Switch to viewer panel on mobile when playground is opened
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

  const togglePlayground = () => {
    const playgroundIsOpen = openDocuments.some(doc => doc.type === "playground")
    
    if (playgroundIsOpen) {
      // Close playground tab
      const playgroundDoc = openDocuments.find(doc => doc.type === "playground")
      if (playgroundDoc) {
        closeDocument(playgroundDoc)
      }
    } else {
      // Open playground tab
      openPlayground()
    }
  }

  const renderDesktopLayout = () => (
    <ResizablePanelGroup direction="horizontal" className="h-full min-h-0">
      <ResizablePanel defaultSize={18} minSize={15} maxSize={25} className="min-h-0">
        <SideNavPanel userId={userId} userRole={userRole} onOpenDocument={openDocument} onOpenPlayground={openPlayground} />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={60} className="flex flex-col min-h-0">
        <MainContent />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={22} minSize={18} maxSize={30} className="min-h-0">
        <RightPanelContainer />
      </ResizablePanel>
    </ResizablePanelGroup>
  )

  const renderMobileLayout = () => (
    <div className="h-full pb-16">
      {activePanel === "explorer" && <SideNavPanel userId={userId} userRole={userRole} onOpenDocument={openDocument} onOpenPlayground={openPlayground} />}
      {activePanel === "viewer" && <MainContent />}
      {activePanel === "stats" && <RightPanelContainer />}
      <MobileNav activePanel={activePanel} setActivePanel={setActivePanel} />
    </div>
  )

  const MainContent = () => (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden">
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
            <div className="flex items-center justify-center mx-auto mb-6">
              <Loader />
            </div>
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Welcome to NeuroCore
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">
              Select a file from the Explorer to begin working with your documents.
            </p>
            <div className="flex flex-col gap-3 text-sm text-slate-500">
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                <span>Try the AI Playground to test bot interactions</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Upload documents to get started</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="h-screen bg-slate-950 text-slate-200 font-sans flex flex-col overflow-hidden">
      <HeaderBar />
      <main className="flex-1 min-h-0 overflow-hidden">{isMobile ? renderMobileLayout() : renderDesktopLayout()}</main>
      {!isMobile && <Footer />}

      {/* Floating Playground Button */}
      <PlaygroundButton onToggle={togglePlayground} isOpen={openDocuments.some(doc => doc.type === "playground")} />
    </div>
  )
}

export default DashboardPage
