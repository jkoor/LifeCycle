"use client"

import { useState, useCallback, useMemo } from "react"
import { createCategory } from "@/app/actions/category"
import type { Category } from "../types"

export interface UseCategorySelectOptions {
  /** 初始分类列表 */
  initialCategories: Category[]
  /** 选择分类后的回调 */
  onSelect?: (categoryId: string) => void
}

export interface UseCategorySelectReturn {
  /** 当前分类列表（包含新创建的） */
  categories: Category[]
  /** 下拉框开启状态 */
  open: boolean
  /** 设置下拉框开启状态 */
  setOpen: (open: boolean) => void
  /** 搜索关键词 */
  searchValue: string
  /** 设置搜索关键词 */
  setSearchValue: (value: string) => void
  /** 是否正在创建分类 */
  isCreating: boolean
  /** 筛选后的分类列表 */
  filteredCategories: Category[]
  /** 是否有匹配的分类 */
  hasMatch: boolean
  /** 创建新分类 */
  handleCreate: (name: string) => Promise<Category | null>
  /** 选择分类 */
  handleSelect: (categoryId: string) => void
  /** 重置状态 */
  reset: () => void
}

/**
 * 分类选择器 Hook
 *
 * 封装分类搜索、选择和新建的完整逻辑
 * 可在多个表单中复用
 *
 * @example
 * ```tsx
 * const { categories, open, setOpen, handleCreate, handleSelect } = useCategorySelect({
 *   initialCategories: props.categories,
 *   onSelect: (id) => form.setValue("categoryId", id),
 * })
 * ```
 */
export function useCategorySelect({
  initialCategories,
  onSelect,
}: UseCategorySelectOptions): UseCategorySelectReturn {
  // Local state
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Computed: 筛选分类
  const filteredCategories = useMemo(() => {
    if (!searchValue.trim()) return categories
    const lowerSearch = searchValue.toLowerCase()
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(lowerSearch)
    )
  }, [categories, searchValue])

  // Computed: 是否有精确匹配
  const hasMatch = useMemo(() => {
    return categories.some(
      (cat) => cat.name.toLowerCase() === searchValue.toLowerCase().trim()
    )
  }, [categories, searchValue])

  // 创建新分类
  const handleCreate = useCallback(
    async (name: string): Promise<Category | null> => {
      if (!name.trim()) return null

      setIsCreating(true)
      try {
        const result = await createCategory(name.trim())

        if (result.success && result.category) {
          const newCategory: Category = {
            id: result.category.id,
            name: result.category.name,
          }
          setCategories((prev) => [...prev, newCategory])
          setOpen(false)
          setSearchValue("")
          onSelect?.(newCategory.id)
          return newCategory
        } else {
          console.error("Failed to create category:", result.error)
          return null
        }
      } catch (error) {
        console.error("Error creating category:", error)
        return null
      } finally {
        setIsCreating(false)
      }
    },
    [onSelect]
  )

  // 选择分类
  const handleSelect = useCallback(
    (categoryId: string) => {
      setOpen(false)
      setSearchValue("")
      onSelect?.(categoryId)
    },
    [onSelect]
  )

  // 重置状态
  const reset = useCallback(() => {
    setOpen(false)
    setSearchValue("")
    setIsCreating(false)
  }, [])

  return {
    categories,
    open,
    setOpen,
    searchValue,
    setSearchValue,
    isCreating,
    filteredCategories,
    hasMatch,
    handleCreate,
    handleSelect,
    reset,
  }
}
