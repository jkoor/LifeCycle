"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  X,
} from "lucide-react"
import { useQueryStates } from "nuqs"
import { inventoryParams } from "@/app/inventory/search-params"
import { cn } from "@/lib/utils"

export function InventoryToolbar() {
  const [params, setParams] = useQueryStates(inventoryParams, {
    shallow: false, // Send to server for filtering
    throttleMs: 500,
  })

  // Clear search handler
  const clearSearch = () => setParams({ q: "" })

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-4">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items..."
            className="pl-9 w-full"
            value={params.q}
            onChange={(e) => setParams({ q: e.target.value || "" })}
          />
          {params.q && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button variant="outline" size="icon" className="shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {/* View toggles */}
        <div className="flex bg-muted p-1 rounded-lg items-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setParams({ view: "table" })}
            className={cn(
              "h-7 w-7 p-0 data-[state=active]:bg-background shadow-none",
              params.view === "table" &&
                "bg-background shadow-sm text-foreground"
            )}
          >
            <ListIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setParams({ view: "grid" })}
            className={cn(
              "h-7 w-7 p-0 text-muted-foreground",
              params.view === "grid" &&
                "bg-background shadow-sm text-foreground"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
