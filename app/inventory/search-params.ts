import { parseAsString, createSearchParamsCache } from "nuqs/server"

export const inventoryParams = {
  q: parseAsString.withDefault(""),
  sort: parseAsString.withDefault("updatedAt"),
  view: parseAsString, // Default to null for responsive behavior
}

export const searchParamsCache = createSearchParamsCache(inventoryParams)
