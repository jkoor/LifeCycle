import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations/auth"

/**
 * 用户注册 API
 * 
 * POST /api/auth/register
 * 
 * 功能:
 * 1. 验证表单数据
 * 2. 检查邮箱是否已存在
 * 3. 加密密码
 * 4. 创建用户
 * 5. 返回用户信息（不含密码）
 */
export async function POST(req: Request) {
  try {
    // 解析请求体
    const body = await req.json()

    // 验证输入数据
    const validatedData = registerSchema.parse(body)

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册，请使用其他邮箱" },
        { status: 400 }
      )
    }

    // 加密密码 (使用 bcrypt, 10 rounds)
    const hashedPassword = await hash(validatedData.password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    // 返回用户信息（不含密码）
    return NextResponse.json(
      {
        message: "注册成功",
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)

    // Zod 验证错误
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "输入数据格式不正确，请检查后重试" },
        { status: 400 }
      )
    }

    // 数据库错误
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      )
    }

    // 其他错误
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    )
  }
}
