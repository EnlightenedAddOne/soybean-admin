import type { CustomRoute } from '@elegant-router/types';
import { layouts, views } from '../elegant/imports';
import { getRoutePath, transformElegantRoutesToVueRoutes } from '../elegant/transform';

/** 根路由：重定向到首页 */
export const ROOT_ROUTE: CustomRoute = {
  name: 'root',
  path: '/',
  redirect: getRoutePath(import.meta.env.VITE_ROUTE_HOME) || '/home',
  meta: {
    title: 'root',
    constant: true
  }
};

/** 404路由：处理未匹配的路径 */
const NOT_FOUND_ROUTE: CustomRoute = {
  name: 'not-found',
  path: '/:pathMatch(.*)*',
  component: 'layout.blank$view.404',
  meta: {
    title: 'not-found',
    constant: true
  }
};

/** 内置路由列表：必须是固定的且在vue-router中初始配置 */
const builtinRoutes: CustomRoute[] = [ROOT_ROUTE, NOT_FOUND_ROUTE];

/**
 * 创建内置的Vue路由
 *
 * 将优雅路由转换为Vue路由格式
 *
 * @returns 转换后的Vue路由配置
 */
export function createBuiltinVueRoutes() {
  return transformElegantRoutesToVueRoutes(builtinRoutes, layouts, views);
}
