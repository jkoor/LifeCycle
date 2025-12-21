import { LayoutDashboard, Package, LineChart } from 'lucide-react';
import { NavConfig } from './types';

/**
 * 全局导航配置
 */
export const navConfig: NavConfig = {
  mainNav: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: '数据总览与统计面板',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      href: '/inventory',
      icon: Package,
      description: '库存管理与物品追踪',
    },
    {
      id: 'analysis',
      label: 'Analysis',
      href: '/analysis',
      icon: LineChart,
      description: '数据分析与可视化',
    },
  ],
};
