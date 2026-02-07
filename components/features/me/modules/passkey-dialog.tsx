"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Loader2,
    Fingerprint,
    Trash2,
    Plus,
    KeyRound,
    Pencil,
    Smartphone,
    Monitor,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface PasskeyDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onPasskeyCountChange?: (count: number) => void
}

interface Passkey {
    id: string
    name: string | null
    credentialID: string
    deviceType: string
    backedUp: boolean
    transports: string | null
    createdAt: Date | string | null
}

type PasskeyStep = "list" | "add" | "rename"

/**
 * 通行密钥管理对话框
 *
 * 功能：
 * - 查看已注册的通行密钥列表
 * - 添加新通行密钥
 * - 重命名通行密钥
 * - 删除通行密钥
 */
export function PasskeyDialog({
    open,
    onOpenChange,
    onPasskeyCountChange,
}: PasskeyDialogProps) {
    const [step, setStep] = useState<PasskeyStep>("list")
    const [passkeys, setPasskeys] = useState<Passkey[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [isRenaming, setIsRenaming] = useState(false)
    const [selectedPasskey, setSelectedPasskey] = useState<Passkey | null>(null)
    const [newName, setNewName] = useState("")
    const [addName, setAddName] = useState("")

    // 加载通行密钥列表
    const loadPasskeys = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data, error } = await authClient.passkey.listUserPasskeys()
            if (error) {
                toast.error("加载通行密钥失败")
                return
            }
            const list = (data ?? []) as Passkey[]
            setPasskeys(list)
            onPasskeyCountChange?.(list.length)
        } catch {
            toast.error("加载通行密钥失败")
        } finally {
            setIsLoading(false)
        }
    }, [onPasskeyCountChange])

    useEffect(() => {
        if (open) {
            loadPasskeys()
            setStep("list")
        }
    }, [open, loadPasskeys])

    // 添加通行密钥
    const handleAdd = async () => {
        setIsAdding(true)
        try {
            const { data, error } = await authClient.passkey.addPasskey({
                name: addName.trim() || undefined,
            })
            if (error) {
                toast.error(
                    typeof error === "object" && "message" in error
                        ? (error as { message: string }).message
                        : "添加通行密钥失败"
                )
                return
            }
            if (data) {
                toast.success("通行密钥添加成功")
                setAddName("")
                setStep("list")
                await loadPasskeys()
            }
        } catch {
            toast.error("添加通行密钥失败，请确保浏览器支持")
        } finally {
            setIsAdding(false)
        }
    }

    // 删除通行密钥
    const handleDelete = async (id: string) => {
        setIsDeleting(id)
        try {
            const { error } = await authClient.passkey.deletePasskey({ id })
            if (error) {
                toast.error("删除通行密钥失败")
                return
            }
            toast.success("通行密钥已删除")
            await loadPasskeys()
        } catch {
            toast.error("删除通行密钥失败")
        } finally {
            setIsDeleting(null)
        }
    }

    // 重命名通行密钥
    const handleRename = async () => {
        if (!selectedPasskey || !newName.trim()) return
        setIsRenaming(true)
        try {
            const { error } = await authClient.passkey.updatePasskey({
                id: selectedPasskey.id,
                name: newName.trim(),
            })
            if (error) {
                toast.error("重命名失败")
                return
            }
            toast.success("通行密钥已重命名")
            setStep("list")
            setSelectedPasskey(null)
            setNewName("")
            await loadPasskeys()
        } catch {
            toast.error("重命名失败")
        } finally {
            setIsRenaming(false)
        }
    }

    // 格式化设备类型
    const getDeviceIcon = (deviceType: string) => {
        if (deviceType === "singleDevice") {
            return <Smartphone className="h-4 w-4 text-muted-foreground" />
        }
        return <Monitor className="h-4 w-4 text-muted-foreground" />
    }

    const getDeviceLabel = (deviceType: string) => {
        return deviceType === "singleDevice" ? "单设备" : "多设备"
    }

    const formatCreatedAt = (date: Date | string | null) => {
        if (!date) return "未知"
        try {
            return formatDistanceToNow(new Date(date), {
                addSuffix: true,
                locale: zhCN,
            })
        } catch {
            return "未知"
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                {/* 列表视图 */}
                {step === "list" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Fingerprint className="h-5 w-5" />
                                通行密钥管理
                            </DialogTitle>
                            <DialogDescription>
                                通行密钥可让您使用指纹、面容或设备 PIN 码安全登录
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : passkeys.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="rounded-full bg-muted p-3 mb-3">
                                        <KeyRound className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium">尚未添加通行密钥</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        添加通行密钥后可无密码登录
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50 max-h-[300px] overflow-y-auto">
                                    {passkeys.map((pk) => (
                                        <div
                                            key={pk.id}
                                            className="flex items-center gap-3 py-3 px-1"
                                        >
                                            <div className="shrink-0 rounded-lg bg-muted p-2">
                                                {getDeviceIcon(pk.deviceType)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {pk.name || "未命名通行密钥"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {getDeviceLabel(pk.deviceType)}
                                                    {pk.backedUp && " · 已备份"}
                                                    {" · "}
                                                    {formatCreatedAt(pk.createdAt)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => {
                                                        setSelectedPasskey(pk)
                                                        setNewName(pk.name || "")
                                                        setStep("rename")
                                                    }}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    disabled={isDeleting === pk.id}
                                                    onClick={() => handleDelete(pk.id)}
                                                >
                                                    {isDeleting === pk.id ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="flex-row gap-2 sm:justify-between">
                            <DialogClose asChild>
                                <Button variant="outline" className="flex-1 sm:flex-none">
                                    关闭
                                </Button>
                            </DialogClose>
                            <Button
                                className="flex-1 sm:flex-none"
                                onClick={() => {
                                    setAddName("")
                                    setStep("add")
                                }}
                            >
                                <Plus className="h-4 w-4 mr-1.5" />
                                添加通行密钥
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {/* 添加视图 */}
                {step === "add" && (
                    <>
                        <DialogHeader>
                            <DialogTitle>添加通行密钥</DialogTitle>
                            <DialogDescription>
                                为此通行密钥设置一个名称以便识别
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            <Input
                                value={addName}
                                onChange={(e) => setAddName(e.target.value)}
                                placeholder="例如：MacBook 指纹、iPhone 面容"
                                maxLength={50}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !isAdding) {
                                        handleAdd()
                                    }
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                名称可选，留空将使用默认名称。点击添加后，请按照浏览器提示完成验证。
                            </p>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setStep("list")}
                                disabled={isAdding}
                            >
                                返回
                            </Button>
                            <Button onClick={handleAdd} disabled={isAdding}>
                                {isAdding && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                添加
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {/* 重命名视图 */}
                {step === "rename" && (
                    <>
                        <DialogHeader>
                            <DialogTitle>重命名通行密钥</DialogTitle>
                        </DialogHeader>

                        <div className="py-4">
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="请输入新名称"
                                maxLength={50}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !isRenaming) {
                                        handleRename()
                                    }
                                }}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setStep("list")
                                    setSelectedPasskey(null)
                                }}
                                disabled={isRenaming}
                            >
                                返回
                            </Button>
                            <Button
                                onClick={handleRename}
                                disabled={isRenaming || !newName.trim()}
                            >
                                {isRenaming && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                保存
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
