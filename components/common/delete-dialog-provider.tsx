"use client"

import {
  useState,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { deleteItem } from "@/app/actions/item"

interface DeleteTarget {
  id: string
  name: string
}

interface DeleteDialogContextValue {
  /** 请求删除物品 */
  requestDelete: (target: DeleteTarget) => void
}

const DeleteDialogContext = createContext<DeleteDialogContextValue | null>(null)

/**
 * 使用删除对话框 Context
 *
 * @example
 * ```tsx
 * const { requestDelete } = useDeleteDialog()
 * <Button onClick={() => requestDelete({ id: item.id, name: item.name })}>
 *   删除
 * </Button>
 * ```
 */
export function useDeleteDialog() {
  const context = useContext(DeleteDialogContext)
  if (!context) {
    throw new Error(
      "useDeleteDialog must be used within a DeleteDialogProvider"
    )
  }
  return context
}

interface DeleteDialogProviderProps {
  children: ReactNode
  /** 删除成功后的回调 */
  onDeleteSuccess?: () => void
}

/**
 * 删除确认对话框 Provider
 *
 * 在列表层级包裹此 Provider，所有子组件可通过
 * useDeleteDialog() 调用 requestDelete 来请求删除。
 *
 * 收益：
 * - 无论有多少个列表项，只渲染一个 AlertDialog
 * - 显著减少 DOM 节点数量
 * - 提升长列表滚动性能
 *
 * @example
 * ```tsx
 * <DeleteDialogProvider onDeleteSuccess={() => router.refresh()}>
 *   {items.map(item => <ItemRow key={item.id} item={item} />)}
 * </DeleteDialogProvider>
 * ```
 */
export function DeleteDialogProvider({
  children,
  onDeleteSuccess,
}: DeleteDialogProviderProps) {
  const [target, setTarget] = useState<DeleteTarget | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const requestDelete = useCallback((newTarget: DeleteTarget) => {
    setTarget(newTarget)
  }, [])

  const handleClose = useCallback(() => {
    if (!isDeleting) {
      setTarget(null)
    }
  }, [isDeleting])

  const handleConfirmDelete = useCallback(async () => {
    if (!target) return

    setIsDeleting(true)
    try {
      const res = await deleteItem(target.id)
      if (res.error) {
        toast.error("删除失败", { description: res.error })
      } else {
        toast.success("物品已删除")
        setTarget(null)
        onDeleteSuccess?.()
      }
    } catch {
      toast.error("删除失败", { description: "网络错误，请重试" })
    } finally {
      setIsDeleting(false)
    }
  }, [target, onDeleteSuccess])

  return (
    <DeleteDialogContext.Provider value={{ requestDelete }}>
      {children}

      {/* 唯一的删除确认对话框 */}
      <AlertDialog
        open={target !== null}
        onOpenChange={(open) => !open && handleClose()}
      >
        <AlertDialogContent className="sm:max-w-lg">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <div className="space-y-2">
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除？</AlertDialogTitle>
                <AlertDialogDescription>
                  您确定要删除「{target?.name}」吗？此操作无法撤销。
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DeleteDialogContext.Provider>
  )
}
