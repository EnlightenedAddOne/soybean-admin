import type { Router } from 'vue-router';
import { createRouteGuard } from './route';
import { createProgressGuard } from './progress';
import { createDocumentTitleGuard } from './title';

/**
 * 创建路由守卫
 *
 * 按顺序挂载以下守卫：
 *
 * 1. 进度条守卫：处理路由切换的加载进度条
 * 2. 路由访问守卫：处理路由的权限和重定向
 * 3. 文档标题守卫：处理页面标题的更新
 *
 * @param router - 路由实例
 */
export function createRouterGuard(router: Router) {
  createProgressGuard(router);
  createRouteGuard(router);
  createDocumentTitleGuard(router);
}
