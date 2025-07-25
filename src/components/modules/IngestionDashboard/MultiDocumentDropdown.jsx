"use client"

import { useMemo, useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown } from "lucide-react"
import { useDocStatusMap } from "@/hooks/useDocStatusMap"

/**
 * Multi‑select dropdown for document IDs.
 *
 * Props:
 *   • `statusInclude` — only show IDs whose status exactly equals this value
 *   • `statusExclude` — hide IDs whose status matches one of these values
 * Supply either `statusInclude` **or** `statusExclude` (not both).
 */
export default function MultiDocumentDropdown({
  value,
  onChange,
  statusInclude, // e.g. "learned"
  statusExclude,
  includeAll = false,
  placeholder = "Select…",
  actionLabel = "sync",
  refreshKey = 0,
}) {
  /* ─────────── fetch id → status map (one API call, cached) ─────────── */
  const { statusMap, loading } = useDocStatusMap(refreshKey)
  /* ─────────── build filtered list ─────────── */
  const docs = useMemo(() => {
    const ids = Object.keys(statusMap)

    const needsFiltering = Boolean(statusInclude) || Boolean(statusExclude?.length)

    if (!needsFiltering) return ids

    return ids.filter((id) => {
      const st = statusMap[id]
      if (statusInclude && st !== statusInclude) return false
      if (statusExclude?.includes(st)) return false
      return true
    })
  }, [statusMap, statusInclude, statusExclude?.join("|")])

  /* ─────────── internal open‑state for Popover ─────────── */
  const [open, setOpen] = useState(false)

  /* ─────────── toggle helper ─────────── */
  const toggle = (id) => {
    console.log("[MultiDocDropdown] click:", id)
    if (id === "ALL") {
      const newValue = value[0] === "ALL" ? [] : ["ALL"]
      onChange(newValue)
      setOpen(false)
      return
    }
    const newValue = value.includes(id) 
      ? value.filter((v) => v !== id) 
      : [...value.filter((v) => v !== "ALL"), id]
    onChange(newValue)
  }

  /* ─────────── summary text ─────────── */
  const summary =
    value.length === 0
      ? placeholder
      : value[0] === "ALL"
        ? `ALL docs to ${actionLabel}`
        : `${value.length} doc${value.length > 1 ? "s" : ""} to ${actionLabel}`

  /* ─────────── render ─────────── */
  const disabled = loading

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center justify-between w-full h-9 bg-gray-700 text-white px-3 rounded disabled:opacity-50"
          disabled={disabled}
        >
          <span className="truncate">{summary}</span>
          <ChevronDown size={16} className="ml-2 shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-64 max-w-64">
        <div className="max-h-48 overflow-y-auto overflow-x-auto">
          <ul className="min-w-max divide-y divide-gray-700">
            {includeAll && (
              <li
                className="flex items-center gap-2 p-2 hover:bg-gray-700 cursor-pointer whitespace-nowrap"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggle("ALL")
                }}
              >
                <Checkbox
                  checked={value[0] === "ALL"}
                  className="size-3 rounded-none border-gray-400 shrink-0 data-[state=checked]:bg-blue-600"
                  onCheckedChange={() => toggle("ALL")}
                />
                ALL
              </li>
            )}

            {docs.map((id) => (
              <li
                key={id}
                className="flex items-center gap-2 p-2 hover:bg-gray-700 cursor-pointer whitespace-nowrap"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggle(id)
                }}
              >
                <Checkbox
                  checked={value.includes(id)}
                  className="size-3 rounded-none border-gray-400 shrink-0 data-[state=checked]:bg-blue-600"
                  onCheckedChange={() => toggle(id)}
                />
                <span title={id}>{id}</span>
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  )
}
