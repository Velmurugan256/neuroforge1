/* ───────────────────────────────────────────────────────────
   src/components/common/api.js
   Central client-side helpers for NeuroForge
   ─────────────────────────────────────────────────────────── */

const BASE_URL = "https://a4pifj82cl.execute-api.us-east-1.amazonaws.com/prod";
const BUCKET   = "neuroforge-dev";   // change if your bucket differs

/* Folder-handler route (create / rename / delete) */
const FOLDER_ROUTE = "/folder_Handler";

/* NEW  ➜  NeuroSync & NeuroWipe Lambda routes */
const SYNC_ROUTE  = "/NeuroSync";
const WIPE_ROUTE  = "/NeuroWipe";
const STATUS_FILE = `${BASE_URL}/filestatus_DB/Get`;   // single-file status

/* Mock bearer until Cognito / JWT is wired in */
const AUTH_HEADER = { Authorization: "Bearer mock.jwt.token" };

/*──────────────────────────── Folder helpers ───────────────────────────*/

/** Extracts [folderPath, folderName] from an S3-style path */
const extractPathAndName = (fullPath) => {
  const parts = fullPath.split("/").filter(Boolean);
  const folderName = parts.pop();
  const folderPath = parts.join("/");
  return [folderPath, folderName];
};

/** Return hierarchical S3 tree (GET) */
export const getS3Tree = async () => {
  const r = await fetch(
    "https://j2zd18f5y1.execute-api.us-east-1.amazonaws.com/prod/get-s3-tree"
  );
  if (!r.ok) throw new Error(`Failed to fetch S3 tree (${r.status})`);
  return r.json();
};

/** Create a folder */
export const createFolder = async (fullPath) => {
  const [folderPath, folderName] = extractPathAndName(fullPath);

  const body = {
    action: "createFolder",
    bucket: BUCKET,
    payload: { path: folderPath, folderName }
  };

  const r = await fetch(`${BASE_URL}${FOLDER_ROUTE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    body: JSON.stringify(body)
  });

  const res = await r.json();
  if (!r.ok) throw new Error(res.message || "Folder creation failed");
  return res;
};

/** Rename any item (folder or file) */
export const renameItem = async (oldPath, newPath) => {
  if (!oldPath || !newPath || oldPath === newPath)
    throw new Error("Invalid rename paths");

  const body = {
    action: "renameFolder",
    bucket: BUCKET,
    payload: { oldPath, newPath }
  };

  const r = await fetch(`${BASE_URL}${FOLDER_ROUTE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    body: JSON.stringify(body)
  });

  const res = await r.json();
  if (!r.ok) throw new Error(res.message || "Rename failed");
  return res;
};

/** Delete a folder */
export const deleteItem = async (path) => {
  if (!path) throw new Error("Invalid delete path");

  const body = {
    action: "deleteFolder",
    bucket: BUCKET,
    payload: { path, folderPath: path } // Delete_Folder_Lambda expects both
  };

  const r = await fetch(`${BASE_URL}${FOLDER_ROUTE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    body: JSON.stringify(body)
  });

  const res = await r.json();
  if (!r.ok) throw new Error(res.message || "Deletion failed");
  return res;
};

/*──────────────────────────── File helpers ───────────────────────────*/

/** Create an empty .json / .txt file */
export const createFile = async (path) => {
  const fileType = path.endsWith(".json")
    ? "json"
    : path.endsWith(".txt")
    ? "txt"
    : null;

  if (!fileType || !path)
    throw new Error("Missing required parameters: file_type and key are required");

  const body = {
    file_type: fileType,
    key: path,
    user_id: "vmarimuthu@endava.com",
    user_role: "Editor"
  };

  const r = await fetch(`${BASE_URL}/file/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    body: JSON.stringify(body)
  });

  const res = await r.json();
  if (!r.ok) throw new Error(res.message || "Failed to create file");
  return res;
};

/** Presigned download URL */
export const getPresignedDownloadUrl = async (path, userId, userRole) => {
  if (!path || !userId || !userRole) throw new Error("Missing parameters");

  const qs = new URLSearchParams({ key: path, user_id: userId, user_role: userRole });
  const r  = await fetch(`${BASE_URL}/file/download-url?${qs}`, {
    headers: AUTH_HEADER
  });

  const res = await r.json();
  if (!r.ok || res.status !== "success" || !res.download_url)
    throw new Error(res.message || "Download URL not returned");

  return res.download_url;
};

/** Read file content (used by FileViewer) */
export const readFileContent = async (path, userId, userRole) => {
  if (!path || !userId || !userRole) throw new Error("Missing parameters");

  const qs = new URLSearchParams({ key: path, user_id: userId, user_role: userRole });
  const r  = await fetch(`${BASE_URL}/file/read?${qs}`);

  let res = await r.json();
  if (!r.ok) throw new Error(res.message || "File read failed");

  if (typeof res.body === "string") {
    try {
      res = JSON.parse(res.body);
    } catch {
      throw new Error("Failed to parse response body");
    }
  }

  if (res.status !== "success" || !res.content)
    throw new Error(res.message || "File content missing");

  return res.content;
};

/** Generic file upload (any MIME) */
export const uploadFile = async (folderPath, file, userId, userRole) => {
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const key = `${folderPath}/${file.name}`.replace(/\/\/+/g, "/");

  const body = { key, content: base64, user_id: userId, user_role: userRole };

  const r = await fetch(`${BASE_URL}/file/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    body: JSON.stringify(body)
  });

  const text = await r.text();
  if (!r.ok) throw new Error(text || `Upload failed (${r.status})`);
  return JSON.parse(text);
};
/*──────────────────────── Status dashboard helpers ─────────────────────*/

const STATUS_BASE = `${BASE_URL}/status/list`;

/**
 * @param {number} limit   max rows
 * @param {string} status  optional status filter
 */
export const fetchRecentActivity = async (limit = 25, status) => {
  const qs = new URLSearchParams({ limit, ...(status && { status }) });
  const r  = await fetch(`${STATUS_BASE}?${qs}`, { headers: AUTH_HEADER });
  if (!r.ok) throw new Error("Status fetch failed");
  return r.json();  // array or {stats, activity}
};

/**
 * NEW helper – one network round‑trip that returns
 * an object keyed by document_id → status.
 *
 * @param {number} limit Max rows to pull (raise if you lift the Lambda cap)
 * @returns {Promise<Record<string,string>>}
 */
export const fetchDocStatusMap = async (limit = 1000) => {
  const qs = new URLSearchParams({ limit });
  const r = await fetch(`${STATUS_BASE}?${qs}`, { headers: AUTH_HEADER });
  if (!r.ok) throw new Error("Status fetch failed");
  const rows = await r.json();
  // ensure we have id + status in each row
  return Object.fromEntries(rows.map((r) => [r.document_id, r.status]));
};

export const computeStats = (rows) =>
  rows.reduce(
    (acc, r) => {
      acc.totalUploaded += 1;
      acc[r.status] = (acc[r.status] || 0) + 1;
      if (!acc.lastUpload || r.timestamp > acc.lastUpload)
        acc.lastUpload = r.timestamp;
      if (
        r.status === "failed" &&
        (!acc.lastFailed || r.timestamp > acc.lastFailed)
      )
        acc.lastFailed = r.timestamp;
      return acc;
    },
    {
      totalUploaded: 0,
      uploaded: 0,
      learned: 0,
      failed: 0,
      lastUpload: null,
      lastFailed: null
    }
  );
/*────────────────────── NEW: NeuroSync  ─────────────────────*/


/**
 * (Re)ingest documents via NeuroSync-Master.
 *
 * @param {"ALL"|string|string[]} target
 *        - "ALL"              → process every doc whose status ≠ learned
 *        - "doc-123"          → force-reprocess one doc
 *        - ["a","b","c"]      → force-reprocess those docs
 * @param {"INGEST"|"RETRY"|"RESUME"|null} action
 *        - Omit / null for implicit-ALL (uploaded ∪ failed ∪ running ∪ retry)
 *        - "RETRY" to rerun *all* failed docs (requires target === "ALL")
 *        - "RESUME" to pick up *all* running docs (target === "ALL")
 */
export const neuroSync = async (target = "ALL", action = null) => {
  /* ---------- build request body --------------------------------------- */
  let body;

  if (Array.isArray(target)) {
    body = { document_ids: target };                       // explicit IDs
  } else if (target === "ALL") {
    body = { scope: "ALL" };                               // bulk mode
    if (action) body.action = action;                      // INGEST/RETRY/RESUME
  } else {
    body = { scope: "SINGLE", document_id: target };       // one ID
  }

  /* ---------- call the API --------------------------------------------- */
  const r = await fetch(`${BASE_URL}${SYNC_ROUTE}`, {
    method : "POST",                                       // POST → easier arrays
    headers: {
      ...AUTH_HEADER,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!r.ok) throw new Error(`NeuroSync failed (${r.status})`);
  return r.json();                                         // { processed, success, … }
};

/* ───────────────────────────  NeuroWipe  (multi-ID)  ──────────────────────────
   Deletes one or more vector documents via the wipe Lambda.
   - Accepts a single string  →  { document_id:  "foo.pdf" }
   - Accepts an array<string> →  { document_ids: ["a.pdf","b.txt"] }
----------------------------------------------------------------------------- */

export const neuroWipe = async (docIds) => {
  // Normalize to an array
  const ids = Array.isArray(docIds) ? docIds : [docIds];

  // Build request body: single key for 1-item, plural key for >1
  const body =
    ids.length === 1
      ? { document_id: ids[0] }
      : { document_ids: ids };

  console.log("[NeuroWipe] 🔫 Request payload →", body);

  const r = await fetch(`${BASE_URL}${WIPE_ROUTE}`, {
    method : "POST",
    headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
    body   : JSON.stringify(body),
  });

  console.log("[NeuroWipe] 📡 Response status:", r.status);

  const data = await r.json().catch(() => ({})); // guard against non-JSON errors
  console.log("[NeuroWipe] 📦 Response body →", data);

  if (!r.ok) {
    throw new Error(`NeuroWipe failed (${r.status})`);
  }

  return data;
};



/*───────────────────────── NEW: fileStatus helper ───────────────────────*/

/**
 * Get latest status for a single document.
 *    GET  /filestatus_DB/Get?document_id=<ID>
 */
export const fileStatus = async (documentId) => {
  if (!documentId) throw new Error("documentId is required");

  const qs = new URLSearchParams({ document_id: documentId });

  const r  = await fetch(`${STATUS_FILE}?${qs}`, { headers: AUTH_HEADER });
  if (!r.ok) throw new Error(`fileStatus failed (${r.status})`);
  return r.json();
};
