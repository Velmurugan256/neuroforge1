"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RefreshCw, Info, Loader2, Activity, Zap, Database, Network, Trash2, Sparkles, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import { fileStatus } from "@/api"
import {
  fetchIngestionData,
  performNeuroSync,
  performNeuroWipe,
  setSyncTargets,
  setWipeTargets,
} from "@/store/slices/ingestionSlice"
import MultiDocumentDropdown from "./MultiDocumentDropdown"
import ConfirmationModal from "@/components/ui/ConfirmationModal"
import GetDetailsModal from "./GetDetailsModal"
import { createCollection, deleteCollection, getCollectionsStatus, createVector } from "@/api/vector"

export default function RightPanelContainer() {
  const dispatch = useDispatch()

  // Get data from Redux store
  const { stats, activity, loading, error, syncing, wiping, syncTargets, wipeTargets, refreshTick } = useSelector(
    (state) => state.ingestion,
  )

  const [isConfirmWipeOpen, setConfirmWipeOpen] = useState(false)
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false)
  const [collectionStatus, setCollectionStatus] = useState(null)
  const [loadingCollection, setLoadingCollection] = useState(false)

  /* ─────────────────── fetch dashboard ─────────────────── */
  const load = () => {
    dispatch(fetchIngestionData())
  }

  const loadCollectionStatus = async () => {
    setLoadingCollection(true)
    try {
      const status = await getCollectionsStatus()
      setCollectionStatus(status)
    } catch (error) {
      console.error("Failed to fetch collection status:", error)
      setCollectionStatus(null)
    } finally {
      setLoadingCollection(false)
    }
  }

  useEffect(() => {
    load()
    loadCollectionStatus()
  }, [dispatch])

  // Auto-refresh when refreshTick changes (triggered by file operations)
  useEffect(() => {
    if (refreshTick > 0) {
      load()
    }
  }, [refreshTick])

  /* ─────────────────── actions ─────────────────── */
  const handleNeuroSync = async () => {
    if (syncTargets.length === 0) return
    const payload = syncTargets.includes("ALL") ? "ALL" : syncTargets
    const toastId = toast.loading("Sending request to NeuroSync...")
    try {
      await dispatch(performNeuroSync(payload)).unwrap()
      toast.success(
        payload === "ALL"
          ? "All documents queued for ingestion"
          : `${syncTargets.length} doc${syncTargets.length > 1 ? "s" : ""} queued for ingestion`,
        { id: toastId },
      )
      dispatch(setSyncTargets([]))
    } catch (e) {
      toast.error("NeuroSync failed", { id: toastId, description: e.message })
    }
  }

  const handleNeuroWipe = async () => {
    if (wipeTargets.length === 0) return
    const payload = wipeTargets.includes("ALL") ? "ALL" : wipeTargets
    const toastId = toast.loading("Processing NeuroWipe request...")
    try {
      await dispatch(performNeuroWipe(payload)).unwrap()
      toast.success(
        payload === "ALL"
          ? "All documents scheduled for deletion"
          : `${wipeTargets.length} doc${wipeTargets.length > 1 ? "s" : ""} scheduled for deletion`,
        { id: toastId },
      )
      dispatch(setWipeTargets([]))
    } catch (e) {
      toast.error("NeuroWipe failed", { id: toastId, description: e.message })
    }
  }

  const handleGetDetails = async (docId) => {
    const toastId = toast.loading("Fetching file status...", { description: docId })
    try {
      const res = await fileStatus(docId)
      toast.info(`Status: ${res.status ?? "Unknown"}`, {
        id: toastId,
        description: <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(res, null, 2)}</pre>,
        duration: 10000,
      })
    } catch (e) {
      toast.error("Failed to get file status", { id: toastId, description: e.message })
    }
  }

  /* ─────────────────── collection management handlers ─────────────────── */
  const handleCreateCollection = async () => {
    const toastId = toast.loading("Creating collection...")
    try {
      const result = await createCollection()
      toast.success("Collection created successfully!", { id: toastId })
      console.log("Collection Result:", result)
      await loadCollectionStatus()
    } catch (e) {
      toast.error("Failed to create collection", {
        id: toastId,
        description: e.message,
      })
    }
  }

  const handleCreateVector = async () => {
    const toastId = toast.loading("Creating vector...")
    try {
      const result = await createVector()
      toast.success("Vector created successfully!", { id: toastId })
    } catch (e) {
      toast.error("Failed to create vector", { id: toastId, description: e.message })
    }
  }

  const handleDeleteCollectionLambda = async () => {
    const toastId = toast.loading("Deleting collection lambda...")
    try {
      const result = await deleteCollection()
      if (result?.message) {
        toast.success(result.message, { id: toastId })
      } else {
        toast.success("Collection lambda deleted successfully!", { id: toastId })
      }
      await loadCollectionStatus()
    } catch (e) {
      toast.error("Failed to delete collection lambda", { id: toastId, description: e.message })
    }
  }

  /* ─────────────────── responsive stat component ─────────────────── */
  const StatCard = ({ icon: Icon, label, value, color = "text-slate-300", accentColor = "cyan" }) => (
    <div className="group relative overflow-hidden h-20 sm:h-24 w-full">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 via-slate-900/40 to-black/60 rounded-lg sm:rounded-xl"></div>
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg sm:rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${
            accentColor === "cyan"
              ? "rgba(6, 182, 212, 0.1)"
              : accentColor === "emerald"
                ? "rgba(16, 185, 129, 0.1)"
                : accentColor === "red"
                  ? "rgba(239, 68, 68, 0.1)"
                  : "rgba(59, 130, 246, 0.1)"
          } 0%, transparent 100%)`,
        }}
      ></div>

      {/* Glass morphism effect */}
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 h-full hover:border-white/20 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10">
        <div className="flex items-center gap-2 sm:gap-3 h-full">
          {/* Icon container with floating effect */}
          <div
            className={`relative p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br ${
              accentColor === "cyan"
                ? "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30"
                : accentColor === "emerald"
                  ? "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30"
                  : accentColor === "red"
                    ? "from-red-500/20 to-red-600/20 border-red-500/30"
                    : "from-blue-500/20 to-blue-600/20 border-blue-500/30"
            } border backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
          >
            <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${color} drop-shadow-lg`} />
            {/* Subtle glow effect */}
            <div
              className={`absolute inset-0 rounded-md sm:rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                accentColor === "cyan"
                  ? "shadow-md shadow-cyan-500/20"
                  : accentColor === "emerald"
                    ? "shadow-md shadow-emerald-500/20"
                    : accentColor === "red"
                      ? "shadow-md shadow-red-500/20"
                      : "shadow-md shadow-blue-500/20"
              }`}
            ></div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-slate-400 text-xs font-medium mb-0.5 sm:mb-1 tracking-wide truncate">{label}</div>
            <div className={`text-sm sm:text-lg font-bold ${color} tracking-tight truncate`} title={String(value)}>
              {String(value)}
            </div>
          </div>
        </div>

        {/* Subtle animated border */}
        <div
          className="absolute inset-0 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${
              accentColor === "cyan"
                ? "rgba(6, 182, 212, 0.3)"
                : accentColor === "emerald"
                  ? "rgba(16, 185, 129, 0.3)"
                  : accentColor === "red"
                    ? "rgba(239, 68, 68, 0.3)"
                    : "rgba(59, 130, 246, 0.3)"
            }, transparent)`,
            backgroundSize: "200% 100%",
            animation: "shimmer 2s infinite",
          }}
        ></div>
      </div>
    </div>
  )

  /* ─────────────────── responsive action button ─────────────────── */
  const ActionButton = ({ onClick, disabled, loading, children, variant = "primary", className = "" }) => {
    const variants = {
      primary:
        "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40",
      danger:
        "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40",
      success:
        "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40",
      secondary:
        "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-lg shadow-slate-500/25 hover:shadow-slate-500/40",
    }

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          ${variants[variant]}
          py-2 sm:py-3 px-3 sm:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-white 
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-1 sm:gap-2 
          transition-all duration-300 
          hover:transform hover:scale-[1.02] hover:-translate-y-0.5
          active:scale-[0.98] active:translate-y-0
          backdrop-blur-sm border border-white/10
          min-h-[36px] sm:min-h-[44px]
          ${className}
        `}
      >
        {loading && <Loader2 className="animate-spin w-3 h-3 sm:w-4 sm:h-4" />}
        {children}
      </button>
    )
  }

  /* ─────────────────── render ─────────────────── */
  return (
    <>
      <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white border-l border-white/10 min-h-0 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-32 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-600/50 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8 relative z-10">
          {/* Responsive Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center border border-cyan-500/30 backdrop-blur-sm">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-cyan-400" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent truncate">
                  Ingestion Dashboard
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm hidden sm:block">Real-time analytics and controls</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
              <button
                onClick={() => setDetailsModalOpen(true)}
                title="File Details"
                className="group relative p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-cyan-400 transition-colors duration-300" />
                <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300"></div>
              </button>

              <button
                onClick={load}
                title="Refresh"
                className="group relative p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
              >
                <RefreshCw
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-cyan-400 transition-colors duration-300 ${loading ? "animate-spin" : ""}`}
                />
                <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300"></div>
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="relative overflow-hidden rounded-lg sm:rounded-2xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 p-3 sm:p-4 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent"></div>
              <div className="relative text-red-400 text-xs sm:text-sm font-medium break-words">{error}</div>
            </div>
          )}

          {/* Loading State */}
          {loading && !error && (
            <div className="flex items-center gap-2 sm:gap-3 text-slate-400 text-xs sm:text-sm">
              <div className="relative flex-shrink-0">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 border-2 border-transparent border-t-cyan-400/50 rounded-full animate-spin animate-reverse"></div>
              </div>
              <span className="font-medium">Loading dashboard data...</span>
            </div>
          )}

          {stats && (
            <>
              {/* Responsive Stats Grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                <StatCard
                  icon={BarChart3}
                  label="Total Documents"
                  value={stats.totalUploaded}
                  accentColor="cyan"
                  color="text-cyan-400"
                />
                <StatCard
                  icon={Sparkles}
                  label="Successfully Learned"
                  value={stats.learned}
                  color="text-emerald-400"
                  accentColor="emerald"
                />
                <StatCard
                  icon={() => <span className="text-xs sm:text-sm">⚠️</span>}
                  label="Processing Failed"
                  value={stats.failed}
                  color="text-red-400"
                  accentColor="red"
                />
                <StatCard
                  icon={() => <span className="text-xs sm:text-sm">📅</span>}
                  label="Last Activity"
                  value={stats.lastUpload?.slice(0, 10) || "—"}
                  color="text-blue-400"
                  accentColor="blue"
                />
              </div>

              {/* Responsive Actions Panel */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5"></div>
                <div className="relative p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex-shrink-0">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent truncate">
                      Neural Operations
                    </h3>
                  </div>

                  {/* NeuroSync Section */}
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
                      <ActionButton
                        onClick={handleNeuroSync}
                        disabled={syncTargets.length === 0}
                        loading={syncing}
                        variant="primary"
                        className="w-full"
                      >
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">NeuroSync</span>
                      </ActionButton>
                      <div className="w-full">
                        <MultiDocumentDropdown
                          value={syncTargets}
                          onChange={(targets) => dispatch(setSyncTargets(targets))}
                          statusExclude={["learned"]}
                          includeAll={true}
                          placeholder="Select documents to sync"
                          actionLabel="sync"
                          refreshKey={refreshTick}
                        />
                      </div>
                    </div>
                  </div>

                  {/* NeuroWipe Section */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
                      <ActionButton
                        onClick={() => setConfirmWipeOpen(true)}
                        disabled={wipeTargets.length === 0}
                        loading={wiping}
                        variant="danger"
                        className="w-full"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">NeuroWipe</span>
                      </ActionButton>
                      <div className="w-full">
                        <MultiDocumentDropdown
                          value={wipeTargets}
                          onChange={(targets) => dispatch(setWipeTargets(targets))}
                          statusInclude="learned"
                          includeAll={true}
                          placeholder="Select documents to wipe"
                          actionLabel="delete"
                          refreshKey={refreshTick}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Activity Feed */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5"></div>
                <div className="relative p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-600/20 border border-emerald-500/30 flex-shrink-0">
                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                          Recent Activity
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>
                            {activity.length} {activity.length === 1 ? "item" : "items"}
                          </span>
                          {activity.length > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span>Live updates</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {activity.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const successCount = activity.filter((item) => item.status === "learned").length
                            const failedCount = activity.filter((item) => item.status === "failed").length
                            const processingCount = activity.filter((item) => item.status === "processing").length

                            toast.info("Activity Summary", {
                              description: `✓ ${successCount} learned • ✗ ${failedCount} failed • ⟳ ${processingCount} processing`,
                              duration: 5000,
                            })
                          }}
                          className="group relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
                          title="Show summary"
                        >
                          <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-emerald-400 transition-colors duration-300" />
                        </button>
                        <button
                          onClick={load}
                          className="group relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
                          title="Refresh activity"
                        >
                          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-emerald-400 transition-colors duration-300" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Activity Stats Bar */}
                  {activity.length > 0 && (
                    <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-slate-800/30 to-slate-900/30 border border-slate-700/50 backdrop-blur-sm">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-emerald-400 font-bold text-sm sm:text-base">
                            {activity.filter((item) => item.status === "learned").length}
                          </div>
                          <div className="text-slate-400 text-xs">Learned</div>
                        </div>
                        <div className="text-center border-x border-slate-700/50">
                          <div className="text-red-400 font-bold text-sm sm:text-base">
                            {activity.filter((item) => item.status === "failed").length}
                          </div>
                          <div className="text-slate-400 text-xs">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-400 font-bold text-sm sm:text-base">
                            {activity.filter((item) => item.status === "processing").length}
                          </div>
                          <div className="text-slate-400 text-xs">Processing</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent">
                    {activity.length === 0 && (
                      <div className="text-center py-8 sm:py-12">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center border border-slate-600/30">
                            <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500" />
                          </div>
                          <div className="absolute inset-0 rounded-full border-2 border-slate-600/20 border-t-emerald-500/50 animate-spin"></div>
                          <div className="absolute inset-2 rounded-full border border-slate-600/10 border-t-cyan-500/30 animate-spin animate-reverse"></div>
                        </div>
                        <p className="text-slate-500 font-medium text-sm sm:text-base mb-2">No recent activity</p>
                        <p className="text-slate-600 text-xs sm:text-sm max-w-48 mx-auto leading-relaxed">
                          Document processing activity will appear here in real-time as files are uploaded and processed
                        </p>
                        <div className="mt-4 flex justify-center">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                            <span>Waiting for activity...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activity.map((item, idx) => {
                      const isRecent = idx < 3
                      const isVeryRecent = idx === 0
                      const statusConfig = {
                        learned: {
                          bg: "bg-emerald-500/20",
                          text: "text-emerald-400",
                          border: "border-emerald-500/30",
                          icon: "✓",
                          pulse: "bg-emerald-400",
                          gradient: "from-emerald-500/10 to-emerald-600/5",
                          shadowColor: "shadow-emerald-500/20",
                        },
                        failed: {
                          bg: "bg-red-500/20",
                          text: "text-red-400",
                          border: "border-red-500/30",
                          icon: "✗",
                          pulse: "bg-red-400",
                          gradient: "from-red-500/10 to-red-600/5",
                          shadowColor: "shadow-red-500/20",
                        },
                        processing: {
                          bg: "bg-blue-500/20",
                          text: "text-blue-400",
                          border: "border-blue-500/30",
                          icon: "⟳",
                          pulse: "bg-blue-400",
                          gradient: "from-blue-500/10 to-blue-600/5",
                          shadowColor: "shadow-blue-500/20",
                        },
                      }

                      const config = statusConfig[item.status] || statusConfig.processing
                      const timeAgo = item.last_modified || item.time

                      // Format time more nicely
                      const formatTime = (timeStr) => {
                        try {
                          const date = new Date(timeStr)
                          const now = new Date()
                          const diffMs = now - date
                          const diffMins = Math.floor(diffMs / 60000)
                          const diffHours = Math.floor(diffMs / 3600000)
                          const diffDays = Math.floor(diffMs / 86400000)

                          if (diffMins < 1) return "Just now"
                          if (diffMins < 60) return `${diffMins}m ago`
                          if (diffHours < 24) return `${diffHours}h ago`
                          if (diffDays < 7) return `${diffDays}d ago`
                          return date.toLocaleDateString()
                        } catch {
                          return timeStr
                        }
                      }

                      // Get file extension for icon
                      const getFileIcon = (filename) => {
                        if (!filename) return "📄"
                        const ext = filename.split(".").pop()?.toLowerCase()
                        const iconMap = {
                          pdf: "📕",
                          doc: "📘",
                          docx: "📘",
                          txt: "📄",
                          md: "📝",
                          json: "🔧",
                          xml: "🔧",
                          csv: "📊",
                          jpg: "🖼️",
                          jpeg: "🖼️",
                          png: "🖼️",
                          gif: "🖼️",
                          mp4: "🎬",
                          mp3: "🎵",
                          zip: "📦",
                          rar: "📦",
                        }
                        return iconMap[ext] || "📄"
                      }

                      return (
                        <div
                          key={idx}
                          className={`group relative overflow-hidden rounded-lg sm:rounded-2xl transition-all duration-500 hover:transform hover:scale-[1.01] ${
                            isVeryRecent
                              ? `bg-gradient-to-r ${config.gradient} border-2 ${config.border} ${config.shadowColor} shadow-lg animate-pulse-slow`
                              : isRecent
                                ? `bg-white/8 hover:bg-white/12 border border-white/15 hover:border-white/25 ring-1 ring-cyan-500/20`
                                : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
                          }`}
                          style={{
                            animationDelay: `${idx * 100}ms`,
                            animationDuration: "0.6s",
                            animationFillMode: "both",
                          }}
                        >
                          {/* Very recent item glow effect */}
                          {isVeryRecent && (
                            <div
                              className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-50 animate-pulse rounded-lg sm:rounded-2xl`}
                            ></div>
                          )}

                          <div className="relative p-3 sm:p-4">
                            <div className="flex items-start gap-3">
                              {/* Enhanced status indicator */}
                              <div className="relative flex-shrink-0">
                                <div
                                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${config.bg} ${config.border} border-2 backdrop-blur-sm flex items-center justify-center relative overflow-hidden`}
                                >
                                  <span className={`text-sm sm:text-base font-bold ${config.text} relative z-10`}>
                                    {config.icon}
                                  </span>

                                  {/* Processing animation */}
                                  {item.status === "processing" && (
                                    <>
                                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400/70 animate-spin"></div>
                                      <div className="absolute inset-1 rounded-full border border-transparent border-t-blue-300/50 animate-spin animate-reverse"></div>
                                    </>
                                  )}

                                  {/* Success pulse */}
                                  {item.status === "learned" && isRecent && (
                                    <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
                                  )}

                                  {/* Failed shake effect */}
                                  {item.status === "failed" && isRecent && (
                                    <div className="absolute inset-0 rounded-full bg-red-400/20 animate-pulse"></div>
                                  )}
                                </div>

                                {/* Status indicator dot */}
                                <div
                                  className={`absolute -top-1 -right-1 w-4 h-4 ${config.pulse} rounded-full border-2 border-slate-900 ${isRecent ? "animate-pulse" : ""}`}
                                ></div>
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Header with enhanced time and status */}
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <div className="text-slate-300 text-xs font-medium bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                                      {formatTime(timeAgo)}
                                    </div>
                                    {isVeryRecent && (
                                      <div className="text-xs text-cyan-300 font-bold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-2.5 py-1 rounded-lg border border-cyan-500/30 animate-pulse">
                                        ✨ Just now
                                      </div>
                                    )}
                                    {isRecent && !isVeryRecent && (
                                      <div className="text-xs text-emerald-300 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                        🆕 New
                                      </div>
                                    )}
                                  </div>
                                  <div
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border ${config.bg} ${config.text} ${config.border} shadow-sm`}
                                  >
                                    {item.status.toUpperCase()}
                                  </div>
                                </div>

                                {/* Enhanced document info */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{getFileIcon(item.document_id)}</span>
                                    <div
                                      className="text-slate-200 font-medium text-sm sm:text-base truncate flex-1"
                                      title={item.document_id}
                                    >
                                      {item.document_id}
                                    </div>
                                    <button
                                      onClick={() => handleGetDetails(item.document_id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-white/10"
                                      title="Get details"
                                    >
                                      <Info className="w-3 h-3 text-slate-400 hover:text-cyan-400" />
                                    </button>
                                  </div>

                                  {/* Enhanced metadata */}
                                  <div className="flex items-center gap-2 text-xs">
                                    {item.file_type && (
                                      <span className="bg-slate-700/60 text-slate-300 px-2 py-1 rounded-md border border-slate-600/50">
                                        {item.file_type.toUpperCase()}
                                      </span>
                                    )}
                                    {item.file_size && (
                                      <span className="bg-slate-700/60 text-slate-300 px-2 py-1 rounded-md border border-slate-600/50">
                                        {item.file_size}
                                      </span>
                                    )}
                                    {item.processing_time && (
                                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md border border-blue-500/30">
                                        {item.processing_time}s
                                      </span>
                                    )}
                                  </div>

                                  {/* Status-specific additional info */}
                                  {item.status === "failed" && item.error_message && (
                                    <div className="text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 truncate">
                                      Error: {item.error_message}
                                    </div>
                                  )}

                                  {item.status === "learned" && item.chunks_created && (
                                    <div className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                      📚 {item.chunks_created} chunks created
                                    </div>
                                  )}
                                </div>

                                {/* Enhanced progress bar for processing items */}
                                {item.status === "processing" && (
                                  <div className="mt-3 space-y-1">
                                    <div className="flex justify-between text-xs text-slate-400">
                                      <span>Processing...</span>
                                      <span>{item.progress || 60}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800/60 rounded-full h-2 overflow-hidden border border-slate-700/50">
                                      <div
                                        className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full transition-all duration-1000 relative overflow-hidden"
                                        style={{ width: `${item.progress || 60}%` }}
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Enhanced hover effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full transform rounded-lg sm:rounded-2xl"></div>

                            {/* Subtle border animation for recent items */}
                            {isRecent && (
                              <div className="absolute inset-0 rounded-lg sm:rounded-2xl border border-transparent bg-gradient-to-r from-cyan-500/20 via-transparent to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Activity footer with quick stats */}
                  {activity.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-700/50">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-4">
                          <span>Total: {activity.length}</span>
                          <span>•</span>
                          <span>
                            Success rate:{" "}
                            {activity.length > 0
                              ? Math.round(
                                  (activity.filter((item) => item.status === "learned").length / activity.length) * 100,
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                          <span>Auto-refresh enabled</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Collection Status Display */}
              {loadingCollection ? (
                <div className="flex items-center gap-2 sm:gap-3 text-slate-400 text-xs sm:text-sm mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-white/5 border border-white/10">
                  <div className="relative flex-shrink-0">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 border-2 border-transparent border-t-blue-400/50 rounded-full animate-spin animate-reverse"></div>
                  </div>
                  <span>Loading collection status...</span>
                </div>
              ) : collectionStatus ? (
                <div className="mb-4 sm:mb-6 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-white/[0.02] border border-white/20 backdrop-blur-sm relative overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>

                  <div className="relative">
                    {/* Header with status indicator */}
                    <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`relative p-2 rounded-lg ${
                            collectionStatus.status === "ACTIVE"
                              ? "bg-emerald-500/20 border border-emerald-500/30"
                              : "bg-red-500/20 border border-red-500/30"
                          } backdrop-blur-sm`}
                        >
                          <Database
                            className={`w-4 h-4 ${
                              collectionStatus.status === "ACTIVE" ? "text-emerald-400" : "text-red-400"
                            }`}
                          />
                          {collectionStatus.status === "ACTIVE" && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4
                            className="text-white font-semibold text-sm sm:text-base truncate"
                            title={collectionStatus.collection_name}
                          >
                            {collectionStatus.collection_name}
                          </h4>
                          <p className="text-slate-400 text-xs">Vector Collection</p>
                        </div>
                      </div>

                      <div
                        className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border flex items-center gap-2 ${
                          collectionStatus.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            collectionStatus.status === "ACTIVE" ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                          }`}
                        ></div>
                        {collectionStatus.status}
                      </div>
                    </div>

                    {/* Collection metrics */}
                    {collectionStatus.status === "ACTIVE" && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                          <div className="text-slate-400 text-xs mb-1">Vectors</div>
                          <div className="text-cyan-400 font-bold text-sm">{collectionStatus.vector_count || "—"}</div>
                        </div>
                        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                          <div className="text-slate-400 text-xs mb-1">Dimensions</div>
                          <div className="text-blue-400 font-bold text-sm">{collectionStatus.dimensions || "1536"}</div>
                        </div>
                      </div>
                    )}

                    {/* Collection details */}
                    <div className="space-y-3">
                      <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-slate-400 text-xs font-medium">Collection ID</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(collectionStatus.collection_id)}
                            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            title="Copy to clipboard"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="font-mono bg-slate-900/50 px-2 py-1.5 rounded text-xs text-slate-300 break-all border border-slate-700/30">
                          {collectionStatus.collection_id}
                        </div>
                      </div>

                      <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-slate-400 text-xs font-medium">ARN</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(collectionStatus.arn)}
                            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            title="Copy to clipboard"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="font-mono bg-slate-900/50 px-2 py-1.5 rounded text-xs text-slate-300 break-all border border-slate-700/30">
                          {collectionStatus.arn}
                        </div>
                      </div>

                      {/* Health indicator */}
                      {collectionStatus.status === "ACTIVE" && (
                        <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="text-emerald-400 text-xs font-medium">Collection Healthy</span>
                          </div>
                          <div className="text-emerald-400 text-xs">
                            Last checked: {new Date().toLocaleTimeString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 sm:mb-6 p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-700/10 via-transparent to-slate-800/10"></div>
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center border border-slate-600/30">
                      <Database className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500" />
                    </div>
                    <p className="text-slate-400 font-medium text-sm sm:text-base mb-2">No Collection Found</p>
                    <p className="text-slate-500 text-xs sm:text-sm max-w-48 mx-auto">
                      Create a collection to start managing your vector database
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4">
                <ActionButton
                  onClick={handleCreateCollection}
                  disabled={collectionStatus?.status === "ACTIVE"}
                  variant="secondary"
                  className="w-full"
                >
                  <Database className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">Create Collection</span>
                </ActionButton>

                <ActionButton onClick={handleCreateVector} variant="success" className="w-full">
                  <Network className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">Create Vector</span>
                </ActionButton>

                <ActionButton
                  onClick={handleDeleteCollectionLambda}
                  disabled={collectionStatus?.status !== "ACTIVE"}
                  variant="danger"
                  className="w-full"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">Delete Collection</span>
                </ActionButton>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={isConfirmWipeOpen}
        onClose={() => setConfirmWipeOpen(false)}
        onConfirm={handleNeuroWipe}
        title="Confirm NeuroWipe"
        message={`Are you sure you want to wipe ${
          wipeTargets.includes("ALL") ? "ALL documents" : `${wipeTargets.length} document(s)`
        }? This action is irreversible.`}
        confirmText="Wipe Documents"
      />

      <GetDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onSubmit={handleGetDetails}
      />

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        .animate-reverse {
          animation-direction: reverse;
        }

        @media (max-width: 475px) {
          .xs\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @keyframes animate-pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-pulse-slow {
          animation: animate-pulse-slow 3s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
