import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";           // shadcn-ui primitive
import { useDocumentIds } from "@/hooks/usedocumentids";

/**
 * Reusable dropdown for document IDs.
 *
 * Props
 * ─────
 * value        – current selection (string)
 * onChange     – fn(nextVal)
 * status       – DynamoDB status filter ("uploaded", "learned", …)
 * includeAll   – add an "ALL" option (useful for NeuroSync)
 * placeholder  – default placeholder text
 */
export default function DocumentSelect({
  value,
  onChange,
  status = "learned",
  includeAll = false,
  placeholder = "None"
}) {
  const { docs, loading } = useDocumentIds(status);

  return (
    <Select value={value} onValueChange={onChange} disabled={loading}>
      <SelectTrigger className="w-full h-9 bg-gray-700">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        {includeAll && <SelectItem value="ALL">ALL</SelectItem>}
        {docs.map((id) => (
          <SelectItem key={id} value={id}>
            {id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
