import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * 获取当前服务端会话
 * 
 * 用于服务端组件和 API 路由
 * @returns Session 对象或 null
 * 
 * @example
 * ```typescript
 * const session = await getServerSession()
 * if (session) {
 *   console.log(session.user.email)
 * }
 * ```
 */
export const getServerSession = async () => {
  return await auth()
}

/**
 * 获取当前登录用户
 * 
 * 从会话中提取用户信息，并从数据库获取完整用户数据
 * @returns User 对象或 null
 * 
 * @example
 * ```typescript
 * const user = await getCurrentUser()
 * if (user) {
 *   console.log(user.name, user.email)
 * }
 * ```
 */
export const getCurrentUser = async () => {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return user
}

/**
 * 获取当前用户 ID
 * 
 * 快速获取当前登录用户的 ID，无需查询数据库
 * @returns User ID 或 null
 * 
 * @example
 * ```typescript
 * const userId = await getCurrentUserId()
 * if (userId) {
 *   // 使用 userId 进行数据库查询
 * }
 * ```
 */
export const getCurrentUserId = async () => {
  const session = await getServerSession()
  return session?.user?.id || null
}

/**
 * 检查用户是否已登录
 * 
 * 快速检查用户登录状态
 * @returns boolean
 * 
 * @example
 * ```typescript
 * const isLoggedIn = await isAuthenticated()
 * if (!isLoggedIn) {
 *   redirect("/auth/login")
 * }
 * ```
 */
export const isAuthenticated = async () => {
  const session = await getServerSession()
  return !!session?.user
}

/**
 * 要求用户必须登录
 * 
 * 用于 API 路由中验证用户身份
 * 如果未登录则抛出错误
 * @returns Session 对象
 * @throws Error - 如果用户未登录
 * 
 * @example
 * ```typescript
 * // 在 API 路由中使用
 * export async function GET() {
 *   try {
 *     const session = await requireAuth()
 *     // 处理已认证的请求
 *   } catch (error) {
 *     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
 *   }
 * }
 * ```
 */
export const requireAuth = async () => {
  const session = await getServerSession()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  return session
}

/**
 * 要求用户必须登录并返回用户信息
 * 
 * 用于 API 路由中验证用户身份并获取完整用户数据
 * 如果未登录则抛出错误
 * @returns User 对象
 * @throws Error - 如果用户未登录或用户不存在
 * 
 * @example
 * ```typescript
 * export async function POST(req: Request) {
 *   try {
 *     const user = await requireUser()
 *     // 使用完整的用户信息
 *   } catch (error) {
 *     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
 *   }
 * }
 * ```
 */
export const requireUser = async () => {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}

/**
 * 验证用户是否拥有指定资源
 * 
 * 检查资源的所有者是否为当前登录用户
 * @param userId - 资源所有者的用户 ID
 * @returns boolean
 * @throws Error - 如果用户未登录
 * 
 * @example
 * ```typescript
 * const item = await prisma.item.findUnique({ where: { id } })
 * const isOwner = await verifyResourceOwnership(item.userId)
 * if (!isOwner) {
 *   return NextResponse.json({ error: "Forbidden" }, { status: 403 })
 * }
 * ```
 */
export const verifyResourceOwnership = async (userId: string) => {
  const currentUserId = await getCurrentUserId()
  
  if (!currentUserId) {
    throw new Error("Unauthorized")
  }

  return currentUserId === userId
}

