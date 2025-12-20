import { z } from "zod"

/**
 * 注册表单验证 Schema
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "姓名至少需要 2 个字符")
    .max(50, "姓名不能超过 50 个字符"),
  email: z
    .string()
    .email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(8, "密码至少需要 8 个字符")
    .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
    .regex(/[a-z]/, "密码必须包含至少一个小写字母")
    .regex(/[0-9]/, "密码必须包含至少一个数字"),
  confirmPassword: z
    .string()
    .min(1, "请确认密码"),
  newsletter: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

/**
 * 登录表单验证 Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "请输入邮箱地址")
    .email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(1, "请输入密码")
    .min(8, "密码至少需要 8 个字符"),
  rememberMe: z.boolean().optional(),
})

/**
 * 注册请求类型
 */
export type RegisterInput = z.infer<typeof registerSchema>

/**
 * 登录请求类型
 */
export type LoginInput = z.infer<typeof loginSchema>
