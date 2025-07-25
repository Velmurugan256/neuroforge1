import MultiDocumentDropdown from "./MultiDocumentDropdown"
export default function NeurosyncDropdown(props) {
  return <MultiDocumentDropdown {...props} statusExclude={["learned"]} actionLabel="sync" includeAll />
}
