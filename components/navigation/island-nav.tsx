'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navConfig } from './nav-config';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * 岛式导航组件
 * 
 * 特点：
 * - 悬浮胶囊形状设计
 * - 基于路由的激活状态
 * - 响应式布局支持
 * - 使用 Shadcn NavigationMenu
 * - 桌面端/移动端自适应
 * - 支持键盘导航和无障碍访问
 */
export function IslandNav() {
    const pathname = usePathname();
    const isMobile = useIsMobile();

    return (
        <TooltipProvider>
            <NavigationMenu className={cn(
                "island-nav",
                // 移动端固定定位：底部悬浮
                "fixed bottom-5 left-1/2 -translate-x-1/2 z-50",
                // 桌面端：静态定位或选择性悬浮
                "md:static md:translate-x-0",
            )}>
                <NavigationMenuList className={cn(
                    // 基础布局
                    "flex p-2",
                    // 悬浮胶囊样式
                    "bg-background/80 backdrop-blur-md",
                    "border border-border/50",
                    "rounded-full shadow-lg",
                    // 移动端：紧凑布局
                    "gap-1 min-h-[48px]",
                    // 桌面端：宽松布局
                    "md:gap-4 md:px-4 md:py-3",
                    // 大屏幕：更大间距
                    "lg:gap-6 lg:px-6",
                )}>
                    {navConfig.mainNav.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        const Icon = item.icon;

                        const navLink = (
                            <Link href={item.href} legacyBehavior passHref>
                                <NavigationMenuLink
                                    className={cn(
                                        // 基础样式
                                        "group inline-flex items-center justify-center gap-2",
                                        "rounded-full",
                                        "text-sm font-medium",
                                        "transition-all duration-300",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        // 移动端样式：图标为主
                                        "min-w-[44px] min-h-[44px] px-3 py-2",
                                        // 桌面端样式：展开显示
                                        "md:px-5 md:py-2.5 md:min-w-0",
                                        "lg:px-6 lg:py-3",
                                        // 默认状态
                                        "text-muted-foreground",
                                        "hover:text-foreground",
                                        "hover:bg-accent/50",
                                        // 激活状态
                                        isActive ? [
                                            "bg-gradient-to-r from-primary to-primary/90",
                                            "text-primary-foreground",
                                            "shadow-md shadow-primary/20",
                                            "px-4", // 移动端选中时增加宽度
                                            "md:px-5 lg:px-6", // 保持桌面端尺寸
                                        ] : "px-3 md:px-5 lg:px-6",
                                    )}
                                    aria-label={`${item.label} - ${item.description}`}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <Icon className={cn(
                                        "transition-transform duration-300",
                                        // 移动端图标大小
                                        "h-5 w-5",
                                        // 桌面端图标大小
                                        "md:h-5 md:w-5",
                                        "lg:h-5 lg:w-5",
                                        // 动画效果
                                        "group-hover:scale-110",
                                        isActive && "scale-110",
                                    )} />
                                    {/* 移动端：仅激活时显示文字 */}
                                    <span className={cn(
                                        "transition-all duration-300 overflow-hidden whitespace-nowrap",
                                        isActive ? "max-w-[100px] opacity-100" : "max-w-0 opacity-0",
                                        // 桌面端：始终显示
                                        "md:max-w-none md:opacity-100",
                                    )}>
                                        {item.label}
                                    </span>
                                </NavigationMenuLink>
                            </Link>
                        );

                        // 桌面端显示工具提示
                        return (
                            <NavigationMenuItem key={item.id}>
                                {!isMobile && item.description ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            {navLink}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{item.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    navLink
                                )}
                            </NavigationMenuItem>
                        );
                    })}
                </NavigationMenuList>
            </NavigationMenu>
        </TooltipProvider>
    );
}
