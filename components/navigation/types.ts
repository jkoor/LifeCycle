import { LucideIcon } from 'lucide-react';

/**
 * 导航项数据结构
 */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

/**
 * 导航配置
 */
export interface NavConfig {
  mainNav: NavItem[];
}
