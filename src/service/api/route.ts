import { request } from '../request';

/** 获取固定路由配置 */
export function fetchGetConstantRoutes() {
  return request<Api.Route.MenuRoute[]>({ url: '/route/getConstantRoutes' });
}

/** 获取用户权限路由 */
export function fetchGetUserRoutes() {
  return request<Api.Route.UserRoute>({ url: '/route/getUserRoutes' });
}

/**
 * 检查路由是否存在
 *
 * @param routeName - 路由名称
 * @returns 路由是否存在的布尔值
 */
export function fetchIsRouteExist(routeName: string) {
  return request<boolean>({ url: '/route/isRouteExist', params: { routeName } });
}
