"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
} from "lucide-react"
import { useQueryStates } from "nuqs"
import {
  inventoryParams,
  sortByOptions,
  sortByLabels,
  type SortByOption,
} from "@/app/inventory/search-params"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function InventoryToolbar() {
  const [params, setParams] = useQueryStates(inventoryParams, {
    shallow: false, // Send to server for filtering
    throttleMs: 500,
  })

  // Clear search handler
  const clearSearch = () => setParams({ q: "" })

  // 切换排序方向
  const toggleSortDir = () => {
    setParams({ sortDir: params.sortDir === "asc" ? "desc" : "asc" })
  }

  // 选择排序字段
  const handleSortByChange = (sortBy: SortByOption) => {
    if (sortBy === params.sortBy) {
      // 如果点击的是当前字段，切换方向
      toggleSortDir()
    } else {
      // 切换到新字段，默认升序
      setParams({ sortBy, sortDir: "asc" })
    }
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-4">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索物品..."
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
      </div>
      <div className="flex items-center gap-2">
        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              {/* <ArrowUpDown className="h-4 w-4" /> */}
              {/* <span className="hidden sm:inline"></span> */}
              <span>{sortByLabels[params.sortBy]}</span>
              {params.sortDir === "asc" ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {sortByOptions.map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => handleSortByChange(option)}
                className="flex items-center justify-between"
              >
                <span>{sortByLabels[option]}</span>
                {params.sortBy === option && (
                  <div className="flex items-center gap-1">
                    {params.sortDir === "asc" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={toggleSortDir}
              className="text-muted-foreground"
            >
              {params.sortDir === "asc" ? "切换为降序" : "切换为升序"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View toggle - single button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() =>
                  setParams({ view: params.view === "grid" ? "table" : "grid" })
                }
                aria-label={
                  params.view === "grid" ? "切换到列表视图" : "切换到网格视图"
                }
              >
                {params.view === "grid" ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <ListIcon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {params.view === "grid" ? "切换到列表视图" : "切换到网格视图"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
