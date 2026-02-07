"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import { registerSchema, loginSchema, type RegisterInput, type LoginInput } from "@/lib/validations/auth"
import { hash } from "bcryptjs"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

/**
 * 用户注册 Server Action
 * 
 * @param values - 注册表单数据
 * @returns 成功或错误消息
 */
export async function registerUser(values: RegisterInput) {
  try {
    // 1. 验证表单数据
    const validatedFields = registerSchema.safeParse(values)

    if (!validatedFields.success) {
      return {
        success: false,
        message: "表单验证失败，请检查输入内容",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { name, email, password } = validatedFields.data

    // 2. 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        success: false,
        message: "该邮箱已被注册",
      }
    }

    // 3. 加密密码
    const hashedPassword = await hash(password, 12)

    // 4. 创建用户
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return {
      success: true,
      message: "注册成功！正在跳转到登录页面...",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      message: "注册失败，请稍后重试",
    }
  }
}

/**
 * 用户登录 Server Action
 * 
 * @param values - 登录表单数据
 */
export async function loginUser(values: LoginInput) {
  try {
    // 1. 验证表单数据
    const validatedFields = loginSchema.safeParse(values)

    if (!validatedFields.success) {
      return {
        success: false,
        message: "表单验证失败，请检查输入内容",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { email, password } = validatedFields.data

    // 2. 尝试登录
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    return {
      success: true,
      message: "登录成功！正在跳转...",
    }
  } catch (error) {
    console.error("Login error:", error)

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            message: "邮箱或密码错误，请重试",
          }
        default:
          return {
            success: false,
            message: "登录失败，请稍后重试",
          }
      }
    }

    return {
      success: false,
      message: "发生未知错误，请稍后重试",
    }
  }
}

/**
 * 用户登出 Server Action
 */
export async function logoutUser() {
  await signOut({ redirectTo: "/login" })
}
