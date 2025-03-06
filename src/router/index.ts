import type { App } from 'vue';
import {
  type RouterHistory,
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router';
import { createBuiltinVueRoutes } from './routes/builtin';
import { createRouterGuard } from './guard';

/** 从环境变量中获取路由模式和基础URL配置 */
const { VITE_ROUTER_HISTORY_MODE = 'history', VITE_BASE_URL } = import.meta.env;

/**
 * 路由历史模式创建函数映射表
 *
 * - hash: 使用URL hash模式
 * - history: 使用HTML5 History模式
 * - memory: 使用内存模式（主要用于SSR）
 */
const historyCreatorMap: Record<Env.RouterHistoryMode, (base?: string) => RouterHistory> = {
  hash: createWebHashHistory,
  history: createWebHistory,
  memory: createMemoryHistory
};

/** 创建路由实例，配置历史模式和基础路由 */
export const router = createRouter({
  history: historyCreatorMap[VITE_ROUTER_HISTORY_MODE](VITE_BASE_URL),
  routes: createBuiltinVueRoutes()
});

/**
 * 初始化Vue路由配置
 *
 * 1. 将路由实例挂载到Vue应用
 * 2. 创建路由守卫
 * 3. 等待路由就绪
 *
 * @param app - Vue应用实例
 */
export async function setupRouter(app: App) {
  app.use(router);
  createRouterGuard(router);
  await router.isReady();
}
