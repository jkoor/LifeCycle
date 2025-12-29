"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  X,
  ArrowUp,
  ArrowDown,
  Check,
  Archive,
  ArchiveRestore,
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
    <div className="flex items-center gap-2 py-4">
      {/* Search input - 限制桌面端最大宽度 */}
      <div className="relative flex-1 md:max-w-xs">
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

      {/* Archive toggle button */}
      <Button
        variant={params.isArchived ? "secondary" : "ghost"}
        size="sm"
        className="h-9 gap-1 shrink-0"
        onClick={() => setParams({ isArchived: !params.isArchived })}
      >
        {params.isArchived ? (
          <>
            <ArchiveRestore className="h-4 w-4" />
            <span className="hidden sm:inline">返回库存</span>
          </>
        ) : (
          <>
            <Archive className="h-4 w-4" />
            <span className="hidden sm:inline">已归档</span>
          </>
        )}
      </Button>

      {/* Sort dropdown - 使用 onSelect + preventDefault 保持菜单开启 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1 shrink-0">
            <span className="hidden sm:inline">
              {sortByLabels[params.sortBy]}
            </span>
            <span className="sm:hidden">排序</span>
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
              onSelect={(e) => {
                e.preventDefault() // 阻止菜单关闭
                handleSortByChange(option)
              }}
              className="flex items-center justify-between cursor-pointer"
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
            onSelect={(e) => {
              e.preventDefault()
              toggleSortDir()
            }}
            className="text-muted-foreground cursor-pointer"
          >
            {params.sortDir === "asc" ? "切换为降序" : "切换为升序"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
