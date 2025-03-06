import { alova } from '../request';

/** 获取固定路由配置 */
export function fetchGetConstantRoutes() {
  return alova.Get<Api.Route.MenuRoute[]>('/route/getConstantRoutes');
}

/** 获取用户权限路由 */
export function fetchGetUserRoutes() {
  return alova.Get<Api.Route.UserRoute>('/route/getUserRoutes');
}

/**
 * 检查路由是否存在
 *
 * @param routeName - 路由名称
 * @returns 路由是否存在
 */
export function fetchIsRouteExist(routeName: string) {
  return alova.Get<boolean>('/route/isRouteExist', { params: { routeName } });
}
