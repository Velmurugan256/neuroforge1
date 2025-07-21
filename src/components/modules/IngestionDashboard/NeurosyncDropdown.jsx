import MultiDocumentDropdown from "@/components/ui/MultiDocumentDropdown"
export default function NeurosyncDropdown(props) {
  return <MultiDocumentDropdown {...props} statusExclude={["learned"]} actionLabel="sync" includeAll />
}
