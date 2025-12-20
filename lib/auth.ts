import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * 获取当前服务端会话
 * 
 * 用于服务端组件和 API 路由
 * @returns Session 对象或 null
 */
export const getServerSession = async () => {
  return await auth()
}

/**
 * 获取当前登录用户
 * 
 * 从会话中提取用户信息，并从数据库获取完整用户数据
 * @returns User 对象或 null
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
 * 要求用户必须登录
 * 
 * 用于 API 路由中验证用户身份
 * 如果未登录则抛出错误
 */
export const requireAuth = async () => {
  const session = await getServerSession()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  return session
}
