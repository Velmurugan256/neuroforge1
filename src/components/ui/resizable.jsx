import * as ResizablePrimitive from "react-resizable-panels"
import { cn } from "@/lib/utils"

/* PanelGroup & Panel wrappers stay unchanged */
const ResizablePanelGroup = ({ className, ...props }) => (
  <ResizablePrimitive.PanelGroup
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

/* NEW – minimal, context-safe handle (no children!) */
const ResizableHandle = ({ className, ...props }) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      // horizontal & vertical styles
      "relative flex w-px items-center justify-center bg-slate-800 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
      "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",
      "data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0",
      className,
    )}
    {...props}
  />
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
