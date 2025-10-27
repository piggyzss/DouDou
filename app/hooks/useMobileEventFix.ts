"use client";

import { useEffect } from 'react';

/**
 * 移动端事件穿透修复Hook
 * 专门解决移动端触摸事件穿透到导航下拉菜单的问题
 */
export function useMobileEventFix() {
  useEffect(() => {
    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    if (!isMobile) return;

    // 简化的移动端事件处理 - 只处理页面内容区域
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      
      // 只处理页面内容区域，完全不干扰导航
      if (target.closest('.mobile-safe-area') && !target.closest('.nav-dropdown')) {
        // 检查是否点击了导航链接（只有菜单未展开时才阻止）
        const navLink = target.closest('a[href]');
        if (navLink && navLink.closest('.nav-dropdown') && !navLink.closest('.nav-dropdown.open')) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      
      // 只处理页面内容区域，完全不干扰导航
      if (target.closest('.mobile-safe-area') && !target.closest('.nav-dropdown')) {
        // 检查是否点击了导航链接（只有菜单未展开时才阻止）
        const navLink = target.closest('a[href]');
        if (navLink && navLink.closest('.nav-dropdown') && !navLink.closest('.nav-dropdown.open')) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }
    };

    // 阻止点击事件穿透
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // 只处理页面内容区域，完全不干扰导航
      if (target.closest('.mobile-safe-area') && !target.closest('.nav-dropdown')) {
        // 检查是否点击了导航链接（只有菜单未展开时才阻止）
        const navLink = target.closest('a[href]');
        if (navLink && navLink.closest('.nav-dropdown') && !navLink.closest('.nav-dropdown.open')) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }
    };

    // 添加事件监听器，使用捕获阶段
    document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: false });
    document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, { capture: true });
      document.removeEventListener('touchend', handleTouchEnd, { capture: true });
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, []);
}
