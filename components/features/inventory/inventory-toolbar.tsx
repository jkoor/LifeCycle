import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react"

export function InventoryToolbar() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-4">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items..."
            className="pl-9 w-full"
          />
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
            className="h-7 w-7 p-0 data-[state=active]:bg-background shadow-none"
          >
            <ListIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
