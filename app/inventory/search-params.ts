import {
  parseAsString,
  parseAsStringLiteral,
  createSearchParamsCache,
} from "nuqs/server"

// 排序字段选项
export const sortByOptions = [
  "remainingDays",
  "name",
  "price",
  "stock",
  "lastReplaced",
] as const
export type SortByOption = (typeof sortByOptions)[number]

// 排序方向选项
export const sortDirOptions = ["asc", "desc"] as const
export type SortDirOption = (typeof sortDirOptions)[number]

// 排序字段的显示标签
export const sortByLabels: Record<SortByOption, string> = {
  remainingDays: "剩余天数",
  name: "标题",
  price: "价格",
  stock: "库存",
  lastReplaced: "上次更换",
}

export const inventoryParams = {
  q: parseAsString.withDefault(""),
  // 排序相关参数
  sortBy: parseAsStringLiteral(sortByOptions).withDefault("remainingDays"),
  sortDir: parseAsStringLiteral(sortDirOptions).withDefault("asc"),
}

export const searchParamsCache = createSearchParamsCache(inventoryParams)
