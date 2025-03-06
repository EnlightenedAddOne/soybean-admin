import type { Router } from 'vue-router';

/**
 * 创建进度条守卫
 *
 * 在路由切换时显示进度条：
 *
 * - 路由切换开始时启动进度条
 * - 路由切换完成时结束进度条
 *
 * @param router - 路由实例
 */
export function createProgressGuard(router: Router) {
  router.beforeEach((_to, _from, next) => {
    // 启动进度条
    window.NProgress?.start?.();
    next();
  });
  router.afterEach(_to => {
    // 结束进度条
    window.NProgress?.done?.();
  });
}
