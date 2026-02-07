"use client"

import { useState } from "react"
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
    AlertTriangle,
    Loader2,
    Eye,
    EyeOff,
    Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"

interface DeleteAccountDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type Step = "confirm" | "password"

/**
 * 删除账户对话框
 *
 * 两步确认 + 密码验证：
 * 1. 第一步：警告用户后果，确认是否继续
 * 2. 第二步：输入当前密码进行身份验证，最终确认删除
 */
export function DeleteAccountDialog({
    open,
    onOpenChange,
}: DeleteAccountDialogProps) {
    const [step, setStep] = useState<Step>("confirm")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const resetForm = () => {
        setStep("confirm")
        setPassword("")
        setShowPassword(false)
        setIsDeleting(false)
    }

    const handleFirstConfirm = () => {
        setStep("password")
    }

    const handleDelete = async () => {
        if (!password) {
            toast.error("请输入密码以确认身份")
            return
        }

        setIsDeleting(true)

        const { error } = await authClient.deleteUser({
            password,
            callbackURL: "/login",
        })

        if (error) {
            setIsDeleting(false)
            toast.error(error.message || "删除账户失败")
            return
        }

        toast.success("账户已删除")
        window.location.href = "/login"
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) resetForm()
                onOpenChange(v)
            }}
        >
            <DialogContent className="sm:max-w-sm">
                {step === "confirm" ? (
                    <>
                        <DialogHeader>
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <DialogTitle className="text-center">
                                确定要删除账户吗？
                            </DialogTitle>
                            <DialogDescription className="text-center">
                                此操作不可撤销，删除后以下数据将被永久移除：
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-3">
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-destructive">•</span>
                                    <span>您的个人资料和账户信息</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-destructive">•</span>
                                    <span>所有物品、分类和标签数据</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-destructive">•</span>
                                    <span>全部使用记录和更换历史</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-destructive">•</span>
                                    <span>所有已登录的会话</span>
                                </li>
                            </ul>
                        </div>
                        <DialogFooter className="flex-col gap-2 sm:flex-col">
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={handleFirstConfirm}
                            >
                                我了解后果，继续删除
                            </Button>
                            <DialogClose asChild>
                                <Button variant="outline" className="w-full">
                                    取消
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>验证身份</DialogTitle>
                            <DialogDescription>
                                请输入您的登录密码以确认删除账户
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    当前密码
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="请输入您的密码"
                                        autoFocus
                                        disabled={isDeleting}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !isDeleting) {
                                                handleDelete()
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-md bg-destructive/5 border border-destructive/20 p-3">
                                <p className="text-xs text-destructive font-medium">
                                    ⚠️ 此操作不可逆，账户删除后所有数据将被永久清除且无法恢复。
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setStep("confirm")}
                                disabled={isDeleting}
                            >
                                返回
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                确认删除
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
