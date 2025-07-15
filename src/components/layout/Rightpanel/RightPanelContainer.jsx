import React, { useEffect, useState } from "react";
import { RefreshCw, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  fetchRecentActivity,
  neuroSync,
  neuroWipe,
  fileStatus
} from "../../common/api";
import MultiDocumentDropdown from "./MultiDocumentDropdown";

const LIMIT = 25;

export default function RightPanelContainer() {
  /* ─────────────────── state ─────────────────── */
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [syncTargets, setSyncTargets] = useState([]);
  const [wipeTargets, setWipeTargets] = useState([]);

  const [syncing, setSyncing] = useState(false);
  const [wiping, setWiping] = useState(false);

  const [refreshTick, setRefreshTick] = useState(0);

  /* ─────────────────── fetch dashboard ─────────────────── */
  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchRecentActivity(LIMIT);

      if (data?.stats) {
        setStats(data.stats);
        setActivity(data.activity || []);
      } else if (Array.isArray(data)) {
        setStats({
          totalUploaded: data.length,
          learned: data.filter((d) => d.status === "learned").length,
          failed: data.filter((d) => d.status === "failed").length,
          lastUpload: data[0]?.last_modified ?? "—",
          lastFailed: data.find((d) => d.status === "failed")?.last_modified ?? "—",
        });
        setActivity(data);
      }
    } catch (e) {
      console.error(e);
      setError("Status fetch failed");
    } finally {
      setLoading(false);
      setRefreshTick((t) => t + 1); // refresh dropdown lists
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─────────────────── actions ─────────────────── */
  const handleNeuroSync = async () => {
    if (syncTargets.length === 0) return;
    setSyncing(true);
    const payload = syncTargets.includes("ALL") ? "ALL" : syncTargets;
    try {
      await neuroSync(payload);
      toast.success(
        payload === "ALL"
          ? "All documents queued for ingestion"
          : `${syncTargets.length} doc${syncTargets.length > 1 ? "s" : ""} queued for ingestion`
      );
      setSyncTargets([]);
      await load();
    } catch (e) {
      toast.error("NeuroSync failed – see console");
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const handleNeuroWipe = async () => {
    if (wipeTargets.length === 0) return;
    if (!window.confirm("Are you sure you want to delete these files?")) return;

    setWiping(true);
    const payload = wipeTargets.includes("ALL") ? "ALL" : wipeTargets;
    try {
      await neuroWipe(payload);
      toast.success(
        payload === "ALL"
          ? "All documents scheduled for deletion"
          : `${wipeTargets.length} doc${wipeTargets.length > 1 ? "s" : ""} scheduled for deletion`
      );
      setWipeTargets([]);
      await load();
    } catch (e) {
      toast.error("NeuroWipe failed – see console");
      console.error(e);
    } finally {
      setWiping(false);
    }
  };

  const handleDetails = async () => {
    const doc = prompt("Enter document ID for fileStatus:");
    if (!doc) return;
    try {
      const res = await fileStatus(doc);
      console.log("🧾 fileStatus result:", res);
      toast(res.status ?? "Success", {
        description: JSON.stringify(res, null, 2),
        duration: 8000,
      });
    } catch (e) {
      toast.error("fileStatus fetch failed – see console");
      console.error(e);
    }
  };

  /* ─────────────────── stat list helper ─────────────────── */
  const Stat = ({ icon, label, value, color = "text-gray-300" }) => (
    <li>
      {icon}&nbsp;<span className={color}>{label}:</span>&nbsp;{value}
    </li>
  );

  /* ─────────────────── render ─────────────────── */
  return (
    <div className="w-144 flex-shrink-0 bg-gray-800 text-white p-4 border-l border-gray-700 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Ingestion&nbsp;Stats</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDetails}
            title="File Details"
            className="bg-gray-700 hover:bg-gray-600 p-1 rounded"
          >
            <Info size={18} />
          </button>
          <button
            onClick={load}
            title="Refresh"
            className="bg-gray-700 hover:bg-gray-600 p-1 rounded"
          >
            <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
          </button>
        </div>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}
      {loading && !error && <div className="text-gray-400 mb-4">Loading…</div>}

      {stats && (
        <>
          {/* Stats */}
          <ul className="text-sm space-y-1 mb-6">
            <Stat icon="📁" label="Total Uploaded" value={stats.totalUploaded} />
            <Stat icon="✅" label="Learned" value={stats.learned} color="text-green-400" />
            <Stat icon="❌" label="Failed" value={stats.failed} color="text-red-400" />
            <Stat icon="⏱️" label="Last Upload" value={stats.lastUpload} />
            <Stat icon="⛔" label="Last Failed" value={stats.lastFailed} />
          </ul>

          {/* Actions */}
          <div className="flex flex-col space-y-4 mb-6">
            {/* NeuroSync */}
            <div className="flex items-center gap-2">
              <button
                className="bg-green-600 hover:bg-green-700 py-2 px-3 rounded text-sm disabled:opacity-50 flex items-center gap-2"
                onClick={handleNeuroSync}
                disabled={syncTargets.length === 0 || syncing}
              >
                {syncing && <Loader2 className="animate-spin" size={14} />}
                🚀 NeuroSync
              </button>
              <MultiDocumentDropdown
                value={syncTargets}
                onChange={setSyncTargets}
                statusExclude={["learned"]}
                includeAll={true}
                placeholder="sync"
                actionLabel="sync"
                refreshKey={refreshTick}
              />
            </div>

            {/* NeuroWipe */}
            <div className="flex items-center gap-2">
              <button
                className="bg-red-600 hover:bg-red-700 py-2 px-3 rounded text-sm disabled:opacity-50 flex items-center gap-2"
                onClick={handleNeuroWipe}
                disabled={wipeTargets.length === 0 || wiping}
              >
                {wiping && <Loader2 className="animate-spin" size={14} />}
                🗑️ NeuroWipe
              </button>
              <MultiDocumentDropdown
                value={wipeTargets}
                onChange={setWipeTargets}
                statusInclude="learned"
                includeAll={true}
                placeholder="wipe"
                actionLabel="delete"
                refreshKey={refreshTick}
              />
            </div>
          </div>

          {/* Activity */}
          <h3 className="text-md font-semibold mb-2">Recent&nbsp;Activity</h3>
          <div className="text-sm space-y-3 max-h-36 overflow-y-auto pr-1">
            {activity.length === 0 && <div className="text-gray-500">No activity yet.</div>}
            {activity.map((it, idx) => (
              <div key={idx} className="border-b border-gray-700 pb-2">
                <div className="text-gray-400 text-xs">{it.last_modified ?? it.time}</div>
                <div className="truncate" title={it.document_id}>{it.document_id}</div>
                <div
                  className={
                    it.status === "learned"
                      ? "text-green-400"
                      : it.status === "failed"
                      ? "text-red-400"
                      : "text-blue-300"
                  }
                >
                  {it.status}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
