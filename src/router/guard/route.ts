import type {
  LocationQueryRaw,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteLocationRaw,
  Router
} from 'vue-router';
import type { RouteKey, RoutePath } from '@elegant-router/types';
import { getRouteName } from '@/router/elegant/transform';
import { useAuthStore } from '@/store/modules/auth';
import { useRouteStore } from '@/store/modules/route';
import { localStg } from '@/utils/storage';

/**
 * 创建路由访问守卫
 *
 * 处理路由访问权限，包括：
 *
 * 1. 路由初始化
 * 2. 登录状态检查
 * 3. 权限验证
 * 4. 特殊路由处理
 *
 * @param router - 路由实例
 */
export function createRouteGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    // 初始化路由
    const location = await initRoute(to);
    if (location) {
      next(location);
      return;
    }

    const authStore = useAuthStore();

    const rootRoute: RouteKey = 'root';
    const loginRoute: RouteKey = 'login';
    const noAuthorizationRoute: RouteKey = '403';

    const isLogin = Boolean(localStg.get('token'));
    const needLogin = !to.meta.constant;
    const routeRoles = to.meta.roles || [];

    const hasRole = authStore.userInfo.roles.some(role => routeRoles.includes(role));
    const hasAuth = authStore.isStaticSuper || !routeRoles.length || hasRole;

    // 已登录时访问登录页，重定向到首页
    if (to.name === loginRoute && isLogin) {
      next({ name: rootRoute });
      return;
    }

    // 不需要登录的路由，直接访问
    if (!needLogin) {
      handleRouteSwitch(to, from, next);
      return;
    }

    // 需要登录但未登录，重定向到登录页
    if (!isLogin) {
      next({ name: loginRoute, query: { redirect: to.fullPath } });
      return;
    }

    // 已登录但无权限，重定向到403页面
    if (!hasAuth) {
      next({ name: noAuthorizationRoute });
      return;
    }

    // 正常路由切换
    handleRouteSwitch(to, from, next);
  });
}

/**
 * 初始化路由
 *
 * 1. 初始化固定路由
 * 2. 处理未登录状态的路由访问
 * 3. 初始化权限路由
 * 4. 处理404路由
 *
 * @param to - 目标路由
 * @returns 重定向位置或null
 */
async function initRoute(to: RouteLocationNormalized): Promise<RouteLocationRaw | null> {
  const routeStore = useRouteStore();

  const notFoundRoute: RouteKey = 'not-found';
  const isNotFoundRoute = to.name === notFoundRoute;

  // 初始化固定路由
  if (!routeStore.isInitConstantRoute) {
    await routeStore.initConstantRoute();

    // 由于固定路由未初始化而被404路由捕获
    // 初始化后重定向到原始路由
    const path = to.fullPath;
    const location: RouteLocationRaw = {
      path,
      replace: true,
      query: to.query,
      hash: to.hash
    };

    return location;
  }

  const isLogin = Boolean(localStg.get('token'));

  if (!isLogin) {
    // 未登录时访问固定路由（非404），允许访问
    if (to.meta.constant && !isNotFoundRoute) {
      routeStore.onRouteSwitchWhenNotLoggedIn();
      return null;
    }

    // 未登录时重定向到登录页
    const loginRoute: RouteKey = 'login';
    const query = getRouteQueryOfLoginRoute(to, routeStore.routeHome);

    const location: RouteLocationRaw = {
      name: loginRoute,
      query
    };

    return location;
  }

  if (!routeStore.isInitAuthRoute) {
    // 初始化权限路由
    await routeStore.initAuthRoute();

    // 由于权限路由未初始化而被404路由捕获
    // 初始化后重定向到原始路由
    if (isNotFoundRoute) {
      const rootRoute: RouteKey = 'root';
      const path = to.redirectedFrom?.name === rootRoute ? '/' : to.fullPath;

      const location: RouteLocationRaw = {
        path,
        replace: true,
        query: to.query,
        hash: to.hash
      };

      return location;
    }
  }

  routeStore.onRouteSwitchWhenLoggedIn();

  // 权限路由已初始化且不是404路由，允许访问
  if (!isNotFoundRoute) {
    return null;
  }

  // 被404路由捕获，检查路由是否存在
  const exist = await routeStore.getIsAuthRouteExist(to.path as RoutePath);
  const noPermissionRoute: RouteKey = '403';

  // 路由存在但无权限，重定向到403页面
  if (exist) {
    const location: RouteLocationRaw = {
      name: noPermissionRoute
    };

    return location;
  }

  return null;
}

/**
 * 处理路由切换
 *
 * 处理特殊路由，如外部链接
 *
 * @param to - 目标路由
 * @param from - 来源路由
 * @param next - 路由守卫方法
 */
function handleRouteSwitch(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  // 处理外部链接路由
  if (to.meta.href) {
    window.open(to.meta.href, '_blank');
    next({ path: from.fullPath, replace: true, query: from.query, hash: to.hash });
    return;
  }

  next();
}

/**
 * 获取登录路由的查询参数
 *
 * 处理登录后的重定向参数
 *
 * @param to - 目标路由
 * @param routeHome - 首页路由
 * @returns 查询参数对象
 */
function getRouteQueryOfLoginRoute(to: RouteLocationNormalized, routeHome: RouteKey) {
  const loginRoute: RouteKey = 'login';
  const redirect = to.fullPath;
  const [redirectPath, redirectQuery] = redirect.split('?');
  const redirectName = getRouteName(redirectPath as RoutePath);

  const isRedirectHome = routeHome === redirectName;

  // 如果不是登录页且不是重定向到首页，则添加重定向参数
  const query: LocationQueryRaw = to.name !== loginRoute && !isRedirectHome ? { redirect } : {};

  // 如果是重定向到首页且有查询参数，则保留查询参数
  if (isRedirectHome && redirectQuery) {
    query.redirect = `/?${redirectQuery}`;
  }

  return query;
}
