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
import { Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"

interface ChangePasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

/**
 * 修改密码对话框
 *
 * 使用 better-auth 的 changePassword API
 */
export function ChangePasswordDialog({
    open,
    onOpenChange,
}: ChangePasswordDialogProps) {
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)

    const resetForm = () => {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setShowCurrentPassword(false)
        setShowNewPassword(false)
    }

    const handleSubmit = async () => {
        if (!currentPassword) {
            toast.error("请输入当前密码")
            return
        }
        if (!newPassword) {
            toast.error("请输入新密码")
            return
        }
        if (newPassword.length < 8) {
            toast.error("新密码至少需要 8 个字符")
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error("两次输入的密码不一致")
            return
        }
        if (currentPassword === newPassword) {
            toast.error("新密码不能与当前密码相同")
            return
        }

        setIsSubmitting(true)

        const { error } = await authClient.changePassword({
            newPassword,
            currentPassword,
            revokeOtherSessions: true,
        })

        setIsSubmitting(false)

        if (error) {
            toast.error(error.message || "修改密码失败")
            return
        }

        toast.success("密码修改成功")
        resetForm()
        onOpenChange(false)
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
                <DialogHeader>
                    <DialogTitle>修改密码</DialogTitle>
                    <DialogDescription>
                        修改后其他设备上的登录状态将被注销
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {/* 当前密码 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">当前密码</label>
                        <div className="relative">
                            <Input
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="请输入当前密码"
                                autoFocus
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                tabIndex={-1}
                            >
                                {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 新密码 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">新密码</label>
                        <div className="relative">
                            <Input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="至少 8 个字符"
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                tabIndex={-1}
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 确认新密码 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">确认新密码</label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="再次输入新密码"
                            disabled={isSubmitting}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !isSubmitting) {
                                    handleSubmit()
                                }
                            }}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">取消</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        确认修改
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
