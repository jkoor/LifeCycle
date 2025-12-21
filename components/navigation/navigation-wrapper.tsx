'use client';

import { usePathname } from 'next/navigation';
import { DockNav } from '@/components/navigation';

/**
 * 导航包装组件
 * 根据当前路由决定是否显示导航栏
 */
export function NavigationWrapper() {
    const pathname = usePathname();

    // 不显示导航的路由路径
    const hideNavPaths = [
        '/auth/login',
        '/auth/register',
        '/', // 首页
    ];

    // 检查是否应该隐藏导航
    const shouldHideNav = hideNavPaths.some(path => pathname === path);

    if (shouldHideNav) {
        return null;
    }

    return <DockNav />;
}
