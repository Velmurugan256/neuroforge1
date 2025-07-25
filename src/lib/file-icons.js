/**
 * Returns the appropriate emoji icon for a file or folder.
 * This centralized helper ensures icons are consistent across the app.
 *
 * @param {string} filename - The name of the file (e.g., "styles.css").
 * @param {boolean} [isFolder=false] - Whether the item is a folder.
 * @param {boolean} [isOpen=false] - If it's a folder, whether it's open.
 * @returns {string} An emoji representing the file type.
 */
export const getFileIcon = (filename, isFolder = false, isOpen = false) => {
  if (isFolder) {
    return isOpen ? "📂" : "📁"
  }

  if (!filename) return "📄"

  const ext = filename.split(".").pop().toLowerCase()
  switch (ext) {
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "html":
    case "css":
    case "scss":
    case "py":
    case "go":
    case "rs":
    case "md":
    case "yml":
    case "toml":
    case "xml":
      return "💻" // Code icon
    case "json":
      return "🧾" // JSON icon
    case "pdf":
      return "📕"
    case "doc":
    case "docx":
      return "📃"
    case "xls":
    case "xlsx":
      return "📊"
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
      return "🖼️" // Image icon
    case "zip":
    case "rar":
    case "7z":
      return "🗜️"
    case "txt":
    default:
      return "📄" // Default text file
  }
}
