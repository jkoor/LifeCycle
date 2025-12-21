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
import {
  FieldDescription,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { registerUser } from "@/lib/actions/auth"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { BorderBeam } from "@/components/ui/border-beam"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string>("")

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      newsletter: false,
    },
  })

  async function onSubmit(values: RegisterInput) {
    setError("")

    startTransition(async () => {
      const result = await registerUser(values)

      if (result.success) {
        toast.success(result.message)
        // 注册成功后跳转到登录页面
        router.push("/auth/login")
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="relative overflow-hidden">
        <BorderBeam size={250} duration={12} delay={9} />
        <CardHeader className="text-center">
          <CardTitle className="text-xl">创建账号</CardTitle>
          <CardDescription>
            输入您的信息以创建账号
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="张三"
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密码</FormLabel>
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>确认密码</FormLabel>
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
              </div>

              <FieldDescription>
                密码必须至少 8 个字符，包含大小写字母和数字
              </FieldDescription>

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                创建账号
              </Button>

              <FieldDescription className="text-center">
                已有账号? <a href="/auth/login" className="underline">立即登录</a>
              </FieldDescription>
            </form>
          </Form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        继续即表示您同意我们的 <a href="#" className="underline">服务条款</a>{" "}
        和 <a href="#" className="underline">隐私政策</a>
      </FieldDescription>
    </div>
  )
}
