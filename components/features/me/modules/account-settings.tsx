"use client"

import { useState } from "react"
import { User } from "better-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  SettingsSection,
  SettingsCard,
  SettingsRow,
  SettingsGroup,
} from "@/components/modules/settings/ui"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Camera,
  KeyRound,
  Shield,
  Trash2,
  Loader2,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { updateUserName, updateUserAvatar } from "@/app/actions/user"

interface AccountSettingsProps {
  user: User
}

/**
 * 账户设置模块
 *
 * iOS 风格设计：
 * - 顶部个人资料卡片
 * - 分组列表样式
 * - 可编辑头像和昵称
 */
export function AccountSettings({ user }: AccountSettingsProps) {
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)
  const [name, setName] = useState(user.name || "")
  const [avatarUrl, setAvatarUrl] = useState(user.image || "")
  const [isUpdatingName, setIsUpdatingName] = useState(false)
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false)

  // Display state (optimistic updates)
  const [displayName, setDisplayName] = useState(user.name || "")
  const [displayAvatar, setDisplayAvatar] = useState(user.image || "")

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  // 处理昵称更新
  const handleNameSubmit = async () => {
    if (!name.trim()) {
      toast.error("昵称不能为空")
      return
    }

    setIsUpdatingName(true)
    const result = await updateUserName({ name: name.trim() })
    setIsUpdatingName(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    setDisplayName(name.trim())
    setIsNameDialogOpen(false)
    toast.success("昵称更新成功")
  }

  // 处理头像更新
  const handleAvatarSubmit = async () => {
    setIsUpdatingAvatar(true)
    const result = await updateUserAvatar({ image: avatarUrl.trim() })
    setIsUpdatingAvatar(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    setDisplayAvatar(avatarUrl.trim())
    setIsAvatarDialogOpen(false)
    toast.success("头像更新成功")
  }

  // 打开头像编辑对话框
  const openAvatarDialog = () => {
    setAvatarUrl(displayAvatar)
    setIsAvatarDialogOpen(true)
  }

  // 打开昵称编辑对话框
  const openNameDialog = () => {
    setName(displayName)
    setIsNameDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* 个人资料卡片 - iOS 风格 */}
      <SettingsCard className="!p-0 md:!p-0">
        <div className="flex items-center gap-4 p-4">
          {/* 头像 */}
          <button
            className="group relative shrink-0"
            onClick={openAvatarDialog}
          >
            <Avatar className="h-16 w-16 border-2 border-border transition-all group-active:scale-95">
              <AvatarImage src={displayAvatar} alt={displayName || "User"} />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </button>

          {/* 用户信息 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">
              {displayName || "未命名用户"}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
            <button
              className="mt-1 text-xs text-primary font-medium hover:underline"
              onClick={openAvatarDialog}
            >
              更换头像
            </button>
          </div>
        </div>
      </SettingsCard>

      {/* 个人信息 */}
      <SettingsSection title="个人信息">
        <SettingsCard className="!p-0 md:!p-0">
          <SettingsGroup>
            <SettingsRow
              label="显示名称"
              description="您在应用中显示的名称"
              showArrow
              onClick={openNameDialog}
            >
              <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                {displayName || "未设置"}
              </span>
            </SettingsRow>

            <SettingsRow label="邮箱地址" description="用于登录和接收通知">
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                {user.email || "未设置"}
              </span>
            </SettingsRow>
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>

      {/* 安全设置 */}
      <SettingsSection title="安全">
        <SettingsCard className="!p-0 md:!p-0">
          <SettingsGroup>
            <SettingsRow
              label="修改密码"
              description="建议定期更换密码"
              showArrow
              onClick={() => {}}
            >
              <KeyRound className="h-4 w-4 text-muted-foreground" />
            </SettingsRow>

            <SettingsRow
              label="两步验证"
              description="增强账户安全性"
              showArrow
              onClick={() => {}}
            >
              <Shield className="h-4 w-4 text-muted-foreground" />
            </SettingsRow>
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>

      {/* 危险区域 */}
      <SettingsSection title="危险区域">
        <SettingsCard className="!p-0 md:!p-0 border-destructive/30">
          <SettingsRow
            label="删除账户"
            description="永久删除您的账户和所有数据"
            onClick={() => {}}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
            <ChevronRight className="h-4 w-4 text-destructive/50" />
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>

      {/* 修改昵称对话框 */}
      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>修改显示名称</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入新的昵称"
              maxLength={50}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isUpdatingName) {
                  handleNameSubmit()
                }
              }}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button onClick={handleNameSubmit} disabled={isUpdatingName}>
              {isUpdatingName && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 修改头像对话框 */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>修改头像</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* 头像预览 */}
            <div className="flex justify-center">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={avatarUrl} alt="预览" />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* 头像 URL 输入 */}
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="请输入头像图片链接"
              type="url"
            />
            <p className="text-xs text-muted-foreground text-center">
              支持任意图片链接，如 Gravatar、图床等
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button onClick={handleAvatarSubmit} disabled={isUpdatingAvatar}>
              {isUpdatingAvatar && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
