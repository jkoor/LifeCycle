"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Field, FieldDescription, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { signIn } from "@/lib/auth-client"
import { authClient } from "@/lib/auth-client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Fingerprint } from "lucide-react"
import { toast } from "sonner"
import { BorderBeam } from "@/components/ui/border-beam"
import { Logo } from "@/components/common/logo"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string>("")
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [isVerifying2FA, setIsVerifying2FA] = useState(false)
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(values: LoginInput) {
    setError("")

    startTransition(async () => {
      await signIn.email({
        email: values.email,
        password: values.password,
        fetchOptions: {
          onResponse: () => {
            // isPending handles loading state via useTransition, but here we await.
            // actually better-auth handles this.
          },
          onSuccess: (ctx) => {
            if (ctx.data.twoFactorRedirect) {
              setShowTwoFactor(true)
              return
            }
            toast.success("登录成功")
            router.push("/dashboard")
            router.refresh()
          },
          onError: (ctx) => {
            setError(ctx.error.message)
            toast.error(ctx.error.message)
          },
        },
      })
    })
  }

  async function handleVerify2FA(code: string) {
    if (code.length !== 6) return
    setIsVerifying2FA(true)
    setError("")

    const { data, error } = await authClient.twoFactor.verifyTotp({
      code,
      trustDevice: true,
    })

    setIsVerifying2FA(false)

    if (error) {
      setError(error.message || "验证码错误")
      setTwoFactorCode("")
      return
    }

    if (data) {
      toast.success("登录成功")
      router.push("/dashboard")
      router.refresh()
    }
  }

  async function handlePasskeySignIn() {
    setIsPasskeyLoading(true)
    setError("")
    try {
      const { data, error } = await authClient.signIn.passkey()
      if (error) {
        setError(
          typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : "通行密钥登录失败"
        )
        return
      }
      if (data) {
        toast.success("登录成功")
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError("通行密钥登录失败，请确保浏览器支持")
    } finally {
      setIsPasskeyLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="relative overflow-hidden">
        <BorderBeam size={250} duration={12} delay={9} />
        <CardHeader className="text-center flex flex-col items-center gap-4">
          <Logo className="scale-125 mb-2" />
          <div className="space-y-1">
            <CardTitle className="text-xl">
              {showTwoFactor ? "两步验证" : "欢迎回来"}
            </CardTitle>
            <CardDescription>
              {showTwoFactor
                ? "请输入身份验证器 App 上的 6 位验证码"
                : "使用您的邮箱和密码登录"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {showTwoFactor ? (
            <div className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-center py-4">
                <InputOTP
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(value) => {
                    setTwoFactorCode(value)
                    if (value.length === 6) {
                      handleVerify2FA(value)
                    }
                  }}
                  disabled={isVerifying2FA}
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
              {isVerifying2FA && (
                <div className="flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => {
                  setShowTwoFactor(false)
                  setTwoFactorCode("")
                  setError("")
                }}
              >
                返回登录
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                    {error}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>密码</FormLabel>
                        <a
                          href="#"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          忘记密码?
                        </a>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                  登录
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">或</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isPasskeyLoading}
                  onClick={handlePasskeySignIn}
                >
                  {isPasskeyLoading ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Fingerprint className="mr-2 size-4" />
                  )}
                  使用通行密钥登录
                </Button>

                <FieldDescription className="text-center">
                  还没有账号?{" "}
                  <a href="/register" className="underline">
                    立即注册
                  </a>
                </FieldDescription>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        继续即表示您同意我们的{" "}
        <a href="#" className="underline">
          服务条款
        </a>{" "}
        和{" "}
        <a href="#" className="underline">
          隐私政策
        </a>
      </FieldDescription>
    </div>
  )
}
