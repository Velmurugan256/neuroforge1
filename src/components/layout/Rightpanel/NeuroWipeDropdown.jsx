import MultiDocumentDropdown from "@/components/ui/MultiDocumentDropdown";
export default function NeuroWipeDropdown(props) {
  return (
    <MultiDocumentDropdown
      {...props}
      statusInclude="learned"
      actionLabel="wipe"
      includeAll
    />
  );
}