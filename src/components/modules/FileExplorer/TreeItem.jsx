import FolderItem from "./FolderItem"
import FileItem from "./FileItem"

const TreeItem = (props) => {
  const { item } = props
  return item.type === "folder" ? <FolderItem {...props} /> : <FileItem {...props} />
}

export default TreeItem
