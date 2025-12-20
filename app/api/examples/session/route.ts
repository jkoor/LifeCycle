/**
 * Session Management API Examples
 * 
 * 这个 API 路由展示了如何在不同场景中使用 lib/auth.ts 中的辅助函数
 */

import { NextResponse } from "next/server"
import { 
  requireAuth, 
  requireUser, 
  getCurrentUserId,
  verifyResourceOwnership 
} from "@/lib/auth"

/**
 * 示例 1: 获取当前用户会话信息
 * 
 * GET /api/examples/session
 * 需要认证
 */
export async function GET() {
  try {
    // 验证用户已登录
    const session = await requireAuth()
    
    return NextResponse.json({
      message: "Session retrieved successfully",
      session: {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
}

/**
 * 示例 2: 获取完整用户信息
 * 
 * POST /api/examples/session
 * 需要认证，返回数据库中的完整用户数据
 */
export async function POST() {
  try {
    // 验证用户已登录并获取完整用户信息
    const user = await requireUser()
    
    return NextResponse.json({
      message: "User data retrieved successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
}

/**
 * 示例 3: 验证资源所有权
 * 
 * PUT /api/examples/session
 * 需要认证，验证用户是否拥有指定资源
 */
export async function PUT(req: Request) {
  try {
    // 获取当前用户 ID
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // 解析请求体
    const { resourceUserId } = await req.json()
    
    if (!resourceUserId) {
      return NextResponse.json(
        { error: "Resource user ID is required" },
        { status: 400 }
      )
    }
    
    // 验证资源所有权
    const isOwner = await verifyResourceOwnership(resourceUserId)
    
    if (!isOwner) {
      return NextResponse.json(
        { error: "Forbidden - You don't own this resource" },
        { status: 403 }
      )
    }
    
    return NextResponse.json({
      message: "Resource ownership verified",
      isOwner: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
}
