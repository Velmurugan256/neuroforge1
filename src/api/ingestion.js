import { BASE_URL, getAuthHeaders } from "@/config/constants"

const SYNC_ROUTE = "/NeuroSync"
const WIPE_ROUTE = "/NeuroWipe"
const STATUS_FILE_ROUTE = `${BASE_URL}/filestatus_DB/Get`
const STATUS_LIST_ROUTE = `${BASE_URL}/status/list`

/**
 * @param {number} limit   max rows
 * @param {string} status  optional status filter
 */
export const fetchRecentActivity = async (limit = 25, status) => {
  const qs = new URLSearchParams({ limit, ...(status && { status }) })
  const r = await fetch(`${STATUS_LIST_ROUTE}?${qs}`, { headers: getAuthHeaders() })
  if (!r.ok) throw new Error("Status fetch failed")
  return r.json()
}

/**
 * Returns an object keyed by document_id → status.
 * @param {number} limit Max rows to pull
 * @returns {Promise<Record<string,string>>}
 */
export const fetchDocStatusMap = async (limit = 1000) => {
  const qs = new URLSearchParams({ limit })
  const r = await fetch(`${STATUS_LIST_ROUTE}?${qs}`, { headers: getAuthHeaders() })
  if (!r.ok) throw new Error("Status fetch failed")
  const rows = await r.json()
  return Object.fromEntries(rows.map((r) => [r.document_id, r.status]))
}

/**
 * (Re)ingest documents via NeuroSync-Master.
 * @param {"ALL"|string|string[]} target
 * @param {"INGEST"|"RETRY"|"RESUME"|null} action
 */
export const neuroSync = async (target = "ALL", action = null) => {
  let body
  if (Array.isArray(target)) {
    body = { document_ids: target }
  } else if (target === "ALL") {
    body = { scope: "ALL" }
    if (action) body.action = action
  } else {
    body = { scope: "SINGLE", document_id: target }
  }

  const r = await fetch(`${BASE_URL}${SYNC_ROUTE}`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!r.ok) throw new Error(`NeuroSync failed (${r.status})`)
  return r.json()
}

/**
 * Deletes one or more vector documents.
 * @param {string|string[]} docIds
 */
export const neuroWipe = async (docIds) => {
  const ids = Array.isArray(docIds) ? docIds : [docIds]
  const body = ids.length === 1 ? { document_id: ids[0] } : { document_ids: ids }

  const r = await fetch(`${BASE_URL}${WIPE_ROUTE}`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`NeuroWipe failed (${r.status})`)
  return data
}

/**
 * Get latest status for a single document.
 * @param {string} documentId
 */
export const fileStatus = async (documentId) => {
  if (!documentId) throw new Error("documentId is required")

  const qs = new URLSearchParams({ document_id: documentId })
  const r = await fetch(`${STATUS_FILE_ROUTE}?${qs}`, { headers: getAuthHeaders() })
  if (!r.ok) throw new Error(`fileStatus failed (${r.status})`)
  return r.json()
}
