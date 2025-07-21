// Returns the appropriate emoji icon for a file or folder
export const getIcon = (filename, isFolder = false, isOpen = false) => {
  if (isFolder) {
    return isOpen ? "📂" : "📁"
  }

  const ext = filename.split(".").pop().toLowerCase()
  switch (ext) {
    case "pdf":
      return "📕"
    case "zip":
      return "🗜"
    case "json":
      return "🧾"
    default:
      return "📄"
  }
}
