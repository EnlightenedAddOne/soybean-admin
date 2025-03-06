import { useRouter } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';
import type { RouteKey } from '@elegant-router/types';
import { router as globalRouter } from '@/router';

/**
 * 路由跳转Hook
 *
 * @param inSetup 是否在setup上下文中使用
 * @returns 路由操作方法
 */
export function useRouterPush(inSetup = true) {
  const router = inSetup ? useRouter() : globalRouter;
  const route = globalRouter.currentRoute;

  const routerPush = router.push;

  const routerBack = router.back;

  interface RouterPushOptions {
    query?: Record<string, string>;
    params?: Record<string, string>;
  }

  /**
   * 按路由键跳转
   *
   * @param key 路由键名
   * @param options 跳转参数
   */
  async function routerPushByKey(key: RouteKey, options?: RouterPushOptions) {
    const { query, params } = options || {};

    const routeLocation: RouteLocationRaw = {
      name: key
    };

    if (Object.keys(query || {}).length) {
      routeLocation.query = query;
    }

    if (Object.keys(params || {}).length) {
      routeLocation.params = params;
    }

    return routerPush(routeLocation);
  }

  function routerPushByKeyWithMetaQuery(key: RouteKey) {
    const allRoutes = router.getRoutes();
    const meta = allRoutes.find(item => item.name === key)?.meta || null;

    const query: Record<string, string> = {};

    meta?.query?.forEach(item => {
      query[item.key] = item.value;
    });

    return routerPushByKey(key, { query });
  }

  async function toHome() {
    return routerPushByKey('root');
  }

  /**
   * 跳转登录页
   *
   * @param loginModule 登录模块类型
   * @param redirectUrl 重定向地址
   */
  async function toLogin(loginModule?: UnionKey.LoginModule, redirectUrl?: string) {
    const module = loginModule || 'pwd-login'; // 默认密码登录

    const options: RouterPushOptions = {
      params: {
        module
      }
    };

    const redirect = redirectUrl || route.value.fullPath;

    options.query = {
      redirect
    };

    return routerPushByKey('login', options);
  }

  /**
   * 切换登录模块
   *
   * @param module 登录模块
   */
  async function toggleLoginModule(module: UnionKey.LoginModule) {
    const query = route.value.query as Record<string, string>;

    return routerPushByKey('login', { query, params: { module } });
  }

  /**
   * 登录后重定向
   *
   * @param needRedirect 是否需要重定向
   */
  async function redirectFromLogin(needRedirect = true) {
    const redirect = route.value.query?.redirect as string;

    if (needRedirect && redirect) {
      await routerPush(redirect);
    } else {
      await toHome();
    }
  }

  return {
    routerPush,
    routerBack,
    routerPushByKey,
    routerPushByKeyWithMetaQuery,
    toLogin,
    toggleLoginModule,
    redirectFromLogin
  };
}
