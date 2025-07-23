import { BASE_URL, BUCKET, AUTH_HEADER, ENDAVA_API_URL } from "@/config/constants"

const FOLDER_ROUTE = "/Folder_Handler"

/** Extracts [folderPath, folderName] from an S3-style path */
const extractPathAndName = (fullPath) => {
  const parts = fullPath.split("/").filter(Boolean)
  const folderName = parts.pop()
  const folderPath = parts.join("/")
  return [folderPath, folderName]
}

/** Return hierarchical S3 tree (GET) */
export const getS3Tree = async () => {
  const r = await fetch(`${ENDAVA_API_URL}/get-s3-tree`)
  if (!r.ok) throw new Error(`Failed to fetch S3 tree (${r.status})`)
  return r.json()
}

/** Create a folder */
export const createFolder = async (fullPath) => {
  const [folderPath, folderName] = extractPathAndName(fullPath)

  const body = {
    action: "createFolder",
    bucket: BUCKET,
    payload: { path: folderPath, folderName },
  }

  const r = await fetch(`${ENDAVA_API_URL}${FOLDER_ROUTE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    body: JSON.stringify(body),
  })

  const res = await r.json()
  if (!r.ok) throw new Error(res.message || "Folder creation failed")
  return res
}

/** Rename any item (folder or file) */
export const renameItem = async (oldPath, newPath) => {
  if (!oldPath || !newPath || oldPath === newPath) throw new Error("Invalid rename paths")

  const body = {
    action: "renameFolder",
    bucket: BUCKET,
    payload: { oldPath, newPath },
  }

  const r = await fetch(`${ENDAVA_API_URL}${FOLDER_ROUTE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    body: JSON.stringify(body),
  })

  const res = await r.json()
  if (!r.ok) throw new Error(res.message || "Rename failed")
  return res
}

/** Delete a folder */
export const deleteItem = async (path) => {
  if (!path) throw new Error("Invalid delete path")

  const body = {
    action: "deleteFolder",
    bucket: BUCKET,
    payload: { path, folderPath: path }, // Delete_Folder_Lambda expects both
  }

  const r = await fetch(`${ENDAVA_API_URL}${FOLDER_ROUTE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    body: JSON.stringify(body),
  })

  const res = await r.json()
  if (!r.ok) throw new Error(res.message || "Deletion failed")
  return res
}

/** Create an empty .json / .txt file */
export const createFile = async (path, userId, userRole) => {
  const fileType = path.endsWith(".json") ? "json" : path.endsWith(".txt") ? "txt" : null

  if (!fileType || !path) throw new Error("Missing required parameters: file_type and key are required")
  if (!userId || !userRole) throw new Error("User ID and role are required")

  const body = {
    file_type: fileType,
    key: path,
    user_id: userId,
    user_role: userRole,
  }

  const r = await fetch(`${ENDAVA_API_URL}/File_Create_file`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    body: JSON.stringify(body),
  })

  const res = await r.json()
  if (!r.ok) throw new Error(res.message || "Failed to create file")
  return res
}

/** Delete a file */
export const deleteFile = async (path, userId, userRole) => {
  if (!path) throw new Error("File path is required")
  if (!userId || !userRole) throw new Error("User ID and role are required")

  const body = {
    key: path,
    user_id: userId,
    user_role: userRole,
  }

  const r = await fetch(`${ENDAVA_API_URL}/File_Delete_file`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    body: JSON.stringify(body),
  })

  const res = await r.json()
  if (!r.ok) throw new Error(res.message || "Failed to delete file")
  return res
}

/** Presigned download URL */
export const getPresignedDownloadUrl = async (path, userId, userRole) => {
  if (!path || !userId || !userRole) throw new Error("Missing parameters")

  const qs = new URLSearchParams({ key: path, user_id: userId, user_role: userRole })
  const r = await fetch(`${BASE_URL}/file/download-url?${qs}`, {
    headers: AUTH_HEADER,
  })

  const res = await r.json()
  if (!r.ok || res.status !== "success" || !res.download_url)
    throw new Error(res.message || "Download URL not returned")

  return res.download_url
}

/** Read file content (used by FileViewer) */
export const readFileContent = async (path, userId, userRole) => {
  if (!path || !userId || !userRole) throw new Error("Missing parameters")

  const qs = new URLSearchParams({ key: path, user_id: userId, user_role: userRole })
  const r = await fetch(`${BASE_URL}/file/read?${qs}`)

  let res = await r.json()
  if (!r.ok) throw new Error(res.message || "File read failed")

  if (typeof res.body === "string") {
    try {
      res = JSON.parse(res.body)
    } catch {
      throw new Error("Failed to parse response body")
    }
  }

  if (res.status !== "success" || !res.content) throw new Error(res.message || "File content missing")

  return res.content
}

/** Generic file upload (any MIME) */
export const uploadFile = async (folderPath, file, userId, userRole) => {
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(",")[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const key = `${folderPath}/${file.name}`.replace(/\/\/+/g, "/")

  const body = { key, content: base64, user_id: userId, user_role: userRole }

  const r = await fetch(`${BASE_URL}/file/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    body: JSON.stringify(body),
  })

  const text = await r.text()
  if (!r.ok) throw new Error(text || `Upload failed (${r.status})`)
  return JSON.parse(text)
}
