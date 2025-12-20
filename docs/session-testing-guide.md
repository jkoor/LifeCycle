# Session Management Testing Guide

本指南说明如何测试 LifeCycle 应用中的会话管理功能。

## 📋 测试检查清单

### 1. 基础会话功能

#### 1.1 服务端会话 (lib/auth.ts)

- [ ] **getServerSession()** - 获取会话对象
  ```typescript
  const session = await getServerSession()
  console.log(session?.user?.email)
  ```

- [ ] **getCurrentUser()** - 从数据库获取完整用户信息
  ```typescript
  const user = await getCurrentUser()
  console.log(user?.name, user?.email, user?.createdAt)
  ```

- [ ] **getCurrentUserId()** - 快速获取用户 ID
  ```typescript
  const userId = await getCurrentUserId()
  console.log(userId)
  ```

- [ ] **isAuthenticated()** - 检查登录状态
  ```typescript
  const isLoggedIn = await isAuthenticated()
  console.log(isLoggedIn ? "已登录" : "未登录")
  ```

- [ ] **requireAuth()** - 要求必须登录（API 路由）
  ```typescript
  try {
    const session = await requireAuth()
    // 继续处理
  } catch (error) {
    // 返回 401 错误
  }
  ```

- [ ] **requireUser()** - 要求必须登录并获取用户
  ```typescript
  try {
    const user = await requireUser()
    // 使用完整用户信息
  } catch (error) {
    // 返回 401 错误
  }
  ```

- [ ] **verifyResourceOwnership()** - 验证资源所有权
  ```typescript
  const isOwner = await verifyResourceOwnership(resourceUserId)
  if (!isOwner) {
    // 返回 403 错误
  }
  ```

#### 1.2 客户端会话 (lib/client-auth.ts)

- [ ] **useSession()** - 获取会话状态
  ```typescript
  const { session, status, isLoading, isAuthenticated } = useSession()
  ```

- [ ] **useUser()** - 获取当前用户
  ```typescript
  const user = useUser()
  console.log(user?.name)
  ```

- [ ] **useUserId()** - 获取用户 ID
  ```typescript
  const userId = useUserId()
  console.log(userId)
  ```

- [ ] **useRequireAuth()** - 要求必须登录（客户端组件）
  ```typescript
  const user = useRequireAuth(() => {
    router.push("/auth/login")
  })
  ```

### 2. API 路由测试

访问 `/api/examples/session` 测试以下功能：

#### 2.1 GET - 获取会话信息

```bash
# 使用浏览器或工具（如 Postman）发送请求
GET http://localhost:3000/api/examples/session
```

**预期结果（已登录）：**
```json
{
  "message": "Session retrieved successfully",
  "session": {
    "user": {
      "id": "...",
      "email": "...",
      "name": "..."
    }
  }
}
```

**预期结果（未登录）：**
```json
{
  "error": "Unauthorized"
}
```
状态码: 401

#### 2.2 POST - 获取完整用户数据

```bash
POST http://localhost:3000/api/examples/session
```

**预期结果（已登录）：**
```json
{
  "message": "User data retrieved successfully",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "image": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### 2.3 PUT - 验证资源所有权

```bash
PUT http://localhost:3000/api/examples/session
Content-Type: application/json

{
  "resourceUserId": "your-user-id-here"
}
```

**预期结果（拥有资源）：**
```json
{
  "message": "Resource ownership verified",
  "isOwner": true
}
```

**预期结果（不拥有资源）：**
```json
{
  "error": "Forbidden - You don't own this resource"
}
```
状态码: 403

### 3. 组件测试

访问 `/examples/session` 查看所有会话管理示例。

#### 3.1 服务端组件

- [ ] **WelcomeMessage** - 显示个性化问候
  - 未登录：显示 "欢迎访问"
  - 已登录：显示 "早上好/下午好/晚上好, [用户名]!"

- [ ] **SessionStatus** - 显示会话状态
  - 显示登录状态徽章
  - 显示用户邮箱和姓名

- [ ] **UserProfileCard** - 显示完整用户资料
  - 显示头像、姓名、邮箱
  - 显示用户 ID、注册时间、最后更新时间

- [ ] **ProtectedContent** - 受保护的内容
  - 未登录：不显示任何内容
  - 已登录：显示用户 ID 和提示信息

#### 3.2 客户端组件

- [ ] **ClientSessionStatus** - 实时会话状态
  - 加载时显示骨架屏
  - 显示状态徽章（loading/authenticated/unauthenticated）
  - 显示登出按钮

- [ ] **ClientUserInfo** - 用户信息卡片
  - 显示姓名、邮箱、用户 ID

- [ ] **ClientProtectedContent** - 受保护的客户端内容
  - 未登录：自动重定向到登录页面
  - 已登录：显示欢迎信息

- [ ] **ClientUserIdDisplay** - 用户 ID 显示
  - 未登录：显示 "未登录"
  - 已登录：显示用户 ID

- [ ] **ClientAuthButton** - 认证按钮
  - 未登录：显示 "登录" 按钮
  - 已登录：显示 "登出" 按钮

### 4. 集成测试场景

#### 场景 1: 新用户注册和登录
1. [ ] 访问 `/auth/register`
2. [ ] 填写注册表单（姓名、邮箱、密码）
3. [ ] 提交表单，验证注册成功
4. [ ] 自动重定向到登录页面
5. [ ] 使用刚注册的凭据登录
6. [ ] 验证登录成功，重定向到首页

#### 场景 2: 会话持久化
1. [ ] 登录应用
2. [ ] 访问 `/examples/session`
3. [ ] 验证所有组件显示正确的用户信息
4. [ ] 刷新页面
5. [ ] 验证会话仍然有效，信息保持不变

#### 场景 3: 受保护路由访问
1. [ ] 未登录状态访问 `/dashboard`
2. [ ] 验证被重定向到 `/auth/login?callbackUrl=/dashboard`
3. [ ] 登录后验证自动重定向回 `/dashboard`

#### 场景 4: API 认证
1. [ ] 未登录状态调用 `GET /api/examples/session`
2. [ ] 验证返回 401 错误
3. [ ] 登录后再次调用
4. [ ] 验证返回正确的会话数据

#### 场景 5: 资源所有权验证
1. [ ] 登录应用
2. [ ] 获取当前用户 ID
3. [ ] 调用 `PUT /api/examples/session`，传入当前用户 ID
4. [ ] 验证返回 `isOwner: true`
5. [ ] 调用相同端点，传入不同的用户 ID
6. [ ] 验证返回 403 错误

#### 场景 6: 登出功能
1. [ ] 登录应用
2. [ ] 点击登出按钮
3. [ ] 验证会话被清除
4. [ ] 验证被重定向到登录页面
5. [ ] 尝试访问受保护路由
6. [ ] 验证再次重定向到登录页面

### 5. 错误处理测试

- [ ] **会话过期** - Auth.js 会自动处理（JWT 默认 30 天过期）
- [ ] **无效会话** - 清除 cookies 后访问受保护资源
- [ ] **数据库用户不存在** - 会话有效但数据库中用户已删除
- [ ] **网络错误** - 客户端组件在网络错误时的行为

### 6. 性能测试

- [ ] **服务端组件** - 验证无客户端 JavaScript 也能显示
- [ ] **Suspense 边界** - 验证加载状态正确显示
- [ ] **缓存行为** - 验证 Next.js 自动缓存服务端数据

## 🧪 测试步骤

### 步骤 1: 启动开发服务器

```bash
pnpm dev
```

### 步骤 2: 创建测试用户

访问 `http://localhost:3000/auth/register` 并创建测试账户：
- 姓名: Test User
- 邮箱: test@example.com
- 密码: Test1234

### 步骤 3: 登录

访问 `http://localhost:3000/auth/login` 并使用测试账户登录。

### 步骤 4: 测试示例页面

访问 `http://localhost:3000/examples/session` 查看所有示例组件。

### 步骤 5: 测试 API 端点

使用浏览器开发者工具或 Postman 测试 API 端点：
- `GET /api/examples/session`
- `POST /api/examples/session`
- `PUT /api/examples/session`

### 步骤 6: 测试路由保护

1. 登出
2. 尝试访问 `/dashboard`
3. 验证重定向到登录页面

### 步骤 7: 测试客户端组件

1. 打开浏览器开发者工具
2. 观察客户端组件的加载状态
3. 验证没有控制台错误

## ✅ 验收标准

所有以下条件必须满足：

1. ✅ 所有 7 个服务端辅助函数正常工作
2. ✅ 所有 4 个客户端钩子正常工作
3. ✅ API 路由正确处理认证和错误
4. ✅ 服务端组件正确显示用户信息
5. ✅ 客户端组件正确处理加载和错误状态
6. ✅ 会话在页面刷新后持久化
7. ✅ 受保护的路由正确重定向
8. ✅ 登出功能正常工作
9. ✅ 资源所有权验证正常工作
10. ✅ 无控制台错误或警告

## 📝 问题报告

如果发现任何问题，请记录：
- 问题描述
- 重现步骤
- 预期行为
- 实际行为
- 浏览器控制台错误（如有）
- 网络请求详情（如有）

## 🎯 下一步

完成所有测试后，可以：
1. 在实际项目中使用这些辅助函数
2. 根据需要扩展更多辅助函数
3. 继续执行下一个任务（#2054: 应用布局组件）
