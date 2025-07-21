"use client"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useDocumentIds } from "@/hooks/useDocumentIds"

export default function Dropdown({
  value = [],
  onChange,
  status = "uploaded",
  placeholder = "Select…",
  includeAll = false,
}) {
  const { docs, loading } = useDocumentIds(status)

  const toggle = (val) => {
    if (val === "ALL") {
      onChange(["ALL"])
    } else {
      onChange((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]))
    }
  }

  return (
    <Select disabled={loading}>
      <SelectTrigger className="w-full h-9 bg-gray-700 text-white">
        <SelectValue placeholder={placeholder}>{value.length === 0 ? placeholder : value.join(", ")}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-48 overflow-y-auto">
        {includeAll && (
          <SelectItem value="ALL" onClick={() => onChange(["ALL"])}>
            ALL
          </SelectItem>
        )}
        {docs.map((id) => (
          <SelectItem key={id} value={id} onClick={() => toggle(id)}>
            <span className="truncate">{id}</span>
            {value.includes(id) && " ✅"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
