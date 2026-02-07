"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from "@/components/ui/input-otp"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog"
import { Loader2, Copy, Check, ShieldCheck, ShieldOff } from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import QRCode from "qrcode"

type TwoFactorStep = "password" | "qr" | "verify" | "backup" | "disable"

interface TwoFactorDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    isEnabled: boolean
    onStatusChange: (enabled: boolean) => void
}

/**
 * 两步验证（TOTP）对话框
 *
 * 启用流程：输入密码 → 扫码 → 验证 OTP → 显示备份码
 * 禁用流程：输入密码 → 确认禁用
 */
export function TwoFactorDialog({
    open,
    onOpenChange,
    isEnabled,
    onStatusChange,
}: TwoFactorDialogProps) {
    const [step, setStep] = useState<TwoFactorStep>(
        isEnabled ? "disable" : "password"
    )
    const [password, setPassword] = useState("")
    const [totpURI, setTotpURI] = useState("")
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState("")
    const [backupCodes, setBackupCodes] = useState<string[]>([])
    const [otpCode, setOtpCode] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [copied, setCopied] = useState(false)

    const resetForm = useCallback(() => {
        setStep(isEnabled ? "disable" : "password")
        setPassword("")
        setTotpURI("")
        setQrCodeDataUrl("")
        setBackupCodes([])
        setOtpCode("")
        setCopied(false)
    }, [isEnabled])

    // Step 1: 用密码启用 2FA，获取 TOTP URI 和备份码
    const handleEnable = async () => {
        if (!password) {
            toast.error("请输入密码")
            return
        }

        setIsSubmitting(true)

        const { data, error } = await authClient.twoFactor.enable({
            password,
        })

        setIsSubmitting(false)

        if (error) {
            toast.error(error.message || "启用两步验证失败")
            return
        }

        if (data?.totpURI) {
            setTotpURI(data.totpURI)
            setBackupCodes(data.backupCodes || [])

            // 生成 QR 码
            try {
                const dataUrl = await QRCode.toDataURL(data.totpURI, {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: "#000000",
                        light: "#ffffff",
                    },
                })
                setQrCodeDataUrl(dataUrl)
            } catch {
                // QR 生成失败，用户可以手动输入密钥
            }

            setStep("qr")
        }
    }

    // Step 2: 验证 TOTP 码
    const handleVerify = async (code: string) => {
        if (code.length !== 6) return

        setIsSubmitting(true)

        const { data, error } = await authClient.twoFactor.verifyTotp({
            code,
        })

        setIsSubmitting(false)

        if (error) {
            toast.error(error.message || "验证码错误")
            setOtpCode("")
            return
        }

        if (data) {
            toast.success("两步验证已启用")
            onStatusChange(true)
            setStep("backup")
        }
    }

    // 禁用 2FA
    const handleDisable = async () => {
        if (!password) {
            toast.error("请输入密码")
            return
        }

        setIsSubmitting(true)

        const { error } = await authClient.twoFactor.disable({
            password,
        })

        setIsSubmitting(false)

        if (error) {
            toast.error(error.message || "禁用两步验证失败")
            return
        }

        toast.success("两步验证已禁用")
        onStatusChange(false)
        onOpenChange(false)
        resetForm()
    }

    // 复制备份码
    const handleCopyBackupCodes = async () => {
        const text = backupCodes.join("\n")
        await navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success("备份码已复制到剪贴板")
        setTimeout(() => setCopied(false), 2000)
    }

    // 从 URI 提取密钥用于手动输入
    const getSecretFromURI = (uri: string) => {
        try {
            const url = new URL(uri)
            return url.searchParams.get("secret") || ""
        } catch {
            return ""
        }
    }

    const renderStep = () => {
        switch (step) {
            // ====== 启用流程 Step 1: 输入密码 ======
            case "password":
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                启用两步验证
                            </DialogTitle>
                            <DialogDescription>
                                两步验证会在登录时要求额外的验证码，大幅提升账户安全性
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    请输入密码以继续
                                </label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="请输入您的密码"
                                    autoFocus
                                    disabled={isSubmitting}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !isSubmitting) {
                                            handleEnable()
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">取消</Button>
                            </DialogClose>
                            <Button onClick={handleEnable} disabled={isSubmitting}>
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                下一步
                            </Button>
                        </DialogFooter>
                    </>
                )

            // ====== 启用流程 Step 2: 扫码 ======
            case "qr":
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>扫描二维码</DialogTitle>
                            <DialogDescription>
                                使用身份验证器 App（如 Google Authenticator、Microsoft
                                Authenticator）扫描下方二维码
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            {/* QR Code */}
                            {qrCodeDataUrl && (
                                <div className="flex justify-center">
                                    <div className="rounded-xl border bg-white p-3">
                                        <img
                                            src={qrCodeDataUrl}
                                            alt="TOTP QR Code"
                                            className="h-48 w-48"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* 手动输入密钥 */}
                            {totpURI && (
                                <div className="space-y-1.5">
                                    <p className="text-xs text-muted-foreground text-center">
                                        或手动输入密钥：
                                    </p>
                                    <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                                        <code className="flex-1 text-xs font-mono break-all select-all">
                                            {getSecretFromURI(totpURI)}
                                        </code>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    getSecretFromURI(totpURI)
                                                )
                                                toast.success("密钥已复制")
                                            }}
                                            className="shrink-0 text-muted-foreground hover:text-foreground"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setStep("password")
                                    setPassword("")
                                }}
                            >
                                返回
                            </Button>
                            <Button onClick={() => setStep("verify")}>下一步</Button>
                        </DialogFooter>
                    </>
                )

            // ====== 启用流程 Step 3: 验证 OTP ======
            case "verify":
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>输入验证码</DialogTitle>
                            <DialogDescription>
                                请输入身份验证器 App 上显示的 6 位验证码
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-6 flex justify-center">
                            <InputOTP
                                maxLength={6}
                                value={otpCode}
                                onChange={(value) => {
                                    setOtpCode(value)
                                    if (value.length === 6) {
                                        handleVerify(value)
                                    }
                                }}
                                disabled={isSubmitting}
                                autoFocus
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        {isSubmitting && (
                            <div className="flex justify-center pb-4">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep("qr")}>
                                返回
                            </Button>
                        </DialogFooter>
                    </>
                )

            // ====== 启用流程 Step 4: 备份码 ======
            case "backup":
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-500" />
                                两步验证已启用
                            </DialogTitle>
                            <DialogDescription>
                                请妥善保存以下备份码，当您无法使用身份验证器时可以使用备份码登录
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            {/* 备份码列表 */}
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {backupCodes.map((code, i) => (
                                        <code
                                            key={i}
                                            className="rounded bg-background px-2 py-1 text-center text-sm font-mono"
                                        >
                                            {code}
                                        </code>
                                    ))}
                                </div>
                            </div>

                            {/* 复制按钮 */}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleCopyBackupCodes}
                            >
                                {copied ? (
                                    <Check className="mr-2 h-4 w-4" />
                                ) : (
                                    <Copy className="mr-2 h-4 w-4" />
                                )}
                                {copied ? "已复制" : "复制备份码"}
                            </Button>

                            <p className="text-xs text-destructive text-center">
                                每个备份码只能使用一次，请将其保存在安全的地方
                            </p>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => {
                                    onOpenChange(false)
                                    resetForm()
                                }}
                            >
                                完成
                            </Button>
                        </DialogFooter>
                    </>
                )

            // ====== 禁用流程 ======
            case "disable":
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShieldOff className="h-5 w-5 text-destructive" />
                                禁用两步验证
                            </DialogTitle>
                            <DialogDescription>
                                禁用后登录将不再需要验证码，这会降低账户安全性
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    请输入密码以确认
                                </label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="请输入您的密码"
                                    autoFocus
                                    disabled={isSubmitting}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !isSubmitting) {
                                            handleDisable()
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">取消</Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={handleDisable}
                                disabled={isSubmitting}
                            >
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                确认禁用
                            </Button>
                        </DialogFooter>
                    </>
                )
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) resetForm()
                onOpenChange(v)
            }}
        >
            <DialogContent className="sm:max-w-sm">{renderStep()}</DialogContent>
        </Dialog>
    )
}
