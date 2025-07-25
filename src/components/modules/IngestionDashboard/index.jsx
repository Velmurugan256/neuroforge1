"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RefreshCw, Info, Loader2, Activity, TrendingUp, Zap } from "lucide-react"
import { toast } from "sonner"
import { fileStatus } from "@/api"
import { fetchIngestionData, performNeuroSync, performNeuroWipe, setSyncTargets, setWipeTargets } from "@/store/slices/ingestionSlice"
import MultiDocumentDropdown from "./MultiDocumentDropdown"
import ConfirmationModal from "@/components/ui/ConfirmationModal"
import GetDetailsModal from "./GetDetailsModal"

export default function RightPanelContainer() {
  const dispatch = useDispatch()
  
  // Get data from Redux store
  const { 
    stats, 
    activity, 
    loading, 
    error,
    syncing,
    wiping,
    syncTargets,
    wipeTargets,
    refreshTick
  } = useSelector((state) => state.ingestion)

  const [isConfirmWipeOpen, setConfirmWipeOpen] = useState(false)
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false)

  /* ─────────────────── fetch dashboard ─────────────────── */
  const load = () => {
    dispatch(fetchIngestionData())
  }

  useEffect(() => {
    load()
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

  /* ─────────────────── stat component helper ─────────────────── */
  const StatCard = ({ icon: Icon, label, value, color = "text-slate-300", bgColor = "bg-slate-800/50" }) => (
    <div className={`${bgColor} rounded-xl p-4 border border-slate-800 overflow-hidden`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-700/50 rounded-lg flex-shrink-0">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-slate-400 text-sm font-medium truncate">{label}</div>
          <div className={`text-lg font-bold ${color} truncate`}>{String(value)}</div>
        </div>
      </div>
    </div>
  )

  /* ─────────────────── render ─────────────────── */
  return (
    <>
      <div className="w-full h-full flex flex-col bg-slate-950 text-white border-l border-slate-800/50 min-h-0">
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent hover:scrollbar-thumb-slate-600 p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-700/50">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Ingestion Stats</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDetailsModalOpen(true)}
                title="File Details"
                className="bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 p-2 rounded-lg transition-all duration-200 border border-slate-700/50"
              >
                <Info className="w-4 h-4" />
              </button>
              <button
                onClick={load}
                title="Refresh"
                className="bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 p-2 rounded-lg transition-all duration-200 border border-slate-700/50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">{error}</div>
          )}

          {loading && !error && (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              Loading…
            </div>
          )}

          {stats && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard icon={() => <span className="text-lg">📁</span>} label="Total" value={stats.totalUploaded} />
                <StatCard
                  icon={() => <span className="text-lg">✅</span>}
                  label="Learned"
                  value={stats.learned}
                  color="text-emerald-400"
                  bgColor="bg-emerald-500/10"
                />
                <StatCard
                  icon={() => <span className="text-lg">❌</span>}
                  label="Failed"
                  value={stats.failed}
                  color="text-red-400"
                  bgColor="bg-red-500/10"
                />
                <StatCard
                  icon={() => <span className="text-lg">⏱️</span>}
                  label="Last Upload"
                  value={stats.lastUpload?.slice(0, 10) || "—"}
                  color="text-blue-400"
                />
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    Actions
                  </h3>

                  {/* NeuroSync */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-3">
                    <button
                      className="bg-cyan-600 hover:bg-cyan-500 py-2.5 px-4 rounded-lg text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
                      onClick={handleNeuroSync}
                      disabled={syncTargets.length === 0 || syncing}
                    >
                      {syncing && <Loader2 className="animate-spin w-4 h-4" />}
                      NeuroSync
                    </button>
                    <MultiDocumentDropdown
                      value={syncTargets}
                      onChange={(targets) => dispatch(setSyncTargets(targets))}
                      statusExclude={["learned"]}
                      includeAll={true}
                      placeholder="sync"
                      actionLabel="sync"
                      refreshKey={refreshTick}
                    />
                  </div>

                  {/* NeuroWipe */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      className="bg-red-600 hover:bg-red-500 py-2.5 px-4 rounded-lg text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
                      onClick={() => setConfirmWipeOpen(true)}
                      disabled={wipeTargets.length === 0 || wiping}
                    >
                      {wiping && <Loader2 className="animate-spin w-4 h-4" />}
                      NeuroWipe
                    </button>
                    <MultiDocumentDropdown
                      value={wipeTargets}
                      onChange={(targets) => dispatch(setWipeTargets(targets))}
                      statusInclude="learned"
                      includeAll={true}
                      placeholder="wipe"
                      actionLabel="delete"
                      refreshKey={refreshTick}
                    />
                  </div>
                </div>
              </div>

              {/* Activity */}
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Recent Activity
                </h3>

                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  {activity.length === 0 && <div className="text-slate-500 text-center py-4">No activity yet.</div>}
                  {activity.map((it, idx) => (
                    <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-800">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="text-slate-400 text-xs flex-shrink-0">{it.last_modified ?? it.time}</div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                            it.status === "learned"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : it.status === "failed"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {it.status}
                        </div>
                      </div>
                      <div className="text-slate-200 text-sm truncate min-w-0" title={it.document_id}>
                        {it.document_id}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
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
    </>
  )
}
