import { computed, nextTick, ref, shallowRef } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { defineStore } from 'pinia';
import { useBoolean } from '@sa/hooks';
import type { CustomRoute, ElegantConstRoute, LastLevelRouteKey, RouteKey, RouteMap } from '@elegant-router/types';
import { SetupStoreId } from '@/enum';
import { router } from '@/router';
import { createStaticRoutes, getAuthVueRoutes } from '@/router/routes';
import { ROOT_ROUTE } from '@/router/routes/builtin';
import { getRouteName, getRoutePath } from '@/router/elegant/transform';
import { fetchGetConstantRoutes, fetchGetUserRoutes, fetchIsRouteExist } from '@/service/api';
import { useAuthStore } from '../auth';
import { useTabStore } from '../tab';
import {
  filterAuthRoutesByRoles,
  getBreadcrumbsByRoute,
  getCacheRouteNames,
  getGlobalMenusByAuthRoutes,
  getSelectedMenuKeyPathByKey,
  isRouteExistByRouteName,
  sortRoutesByOrder,
  transformMenuToSearchMenus,
  updateLocaleOfGlobalMenus
} from './shared';

/** 路由状态管理 */
export const useRouteStore = defineStore(SetupStoreId.Route, () => {
  const authStore = useAuthStore();
  const tabStore = useTabStore();
  const { bool: isInitConstantRoute, setBool: setIsInitConstantRoute } = useBoolean();
  const { bool: isInitAuthRoute, setBool: setIsInitAuthRoute } = useBoolean();

  /**
   * 权限路由模式
   *
   * 建议在开发环境使用静态模式，生产环境使用动态模式 如果在开发环境使用静态模式，权限路由将由 "@elegant-router/vue" 插件自动生成
   */
  const authRouteMode = ref(import.meta.env.VITE_AUTH_ROUTE_MODE);

  /** 首页路由键名 */
  const routeHome = ref(import.meta.env.VITE_ROUTE_HOME);

  /**
   * 设置首页路由
   *
   * @param routeKey - 路由键名
   */
  function setRouteHome(routeKey: LastLevelRouteKey) {
    routeHome.value = routeKey;
  }

  /** 固定路由 */
  const constantRoutes = shallowRef<ElegantConstRoute[]>([]);

  /**
   * 添加固定路由
   *
   * @param routes - 路由配置数组
   */
  function addConstantRoutes(routes: ElegantConstRoute[]) {
    const constantRoutesMap = new Map<string, ElegantConstRoute>([]);

    routes.forEach(route => {
      constantRoutesMap.set(route.name, route);
    });

    constantRoutes.value = Array.from(constantRoutesMap.values());
  }

  /** 权限路由 */
  const authRoutes = shallowRef<ElegantConstRoute[]>([]);

  /**
   * 添加权限路由
   *
   * @param routes - 路由配置数组
   */
  function addAuthRoutes(routes: ElegantConstRoute[]) {
    const authRoutesMap = new Map<string, ElegantConstRoute>([]);

    routes.forEach(route => {
      authRoutesMap.set(route.name, route);
    });

    authRoutes.value = Array.from(authRoutesMap.values());
  }

  /** 路由移除函数数组 */
  const removeRouteFns: (() => void)[] = [];

  /** 全局菜单 */
  const menus = ref<App.Global.Menu[]>([]);
  /** 搜索菜单 */
  const searchMenus = computed(() => transformMenuToSearchMenus(menus.value));

  /**
   * 获取全局菜单
   *
   * @param routes - 路由配置数组
   */
  function getGlobalMenus(routes: ElegantConstRoute[]) {
    menus.value = getGlobalMenusByAuthRoutes(routes);
  }

  /** 根据语言更新全局菜单 */
  function updateGlobalMenusByLocale() {
    menus.value = updateLocaleOfGlobalMenus(menus.value);
  }

  /** 缓存路由 */
  const cacheRoutes = ref<RouteKey[]>([]);

  /** 排除缓存的路由 用于重置路由缓存 */
  const excludeCacheRoutes = ref<RouteKey[]>([]);

  /**
   * 获取需要缓存的路由
   *
   * @param routes - Vue路由配置数组
   */
  function getCacheRoutes(routes: RouteRecordRaw[]) {
    cacheRoutes.value = getCacheRouteNames(routes);
  }

  /**
   * 重置路由缓存
   *
   * @param routeKey - 路由键名，默认为当前路由名称
   */
  async function resetRouteCache(routeKey?: RouteKey) {
    const routeName = routeKey || (router.currentRoute.value.name as RouteKey);

    excludeCacheRoutes.value.push(routeName);

    await nextTick();

    excludeCacheRoutes.value = [];
  }

  /** 全局面包屑 */
  const breadcrumbs = computed(() => getBreadcrumbsByRoute(router.currentRoute.value, menus.value));

  /** 重置状态 */
  async function resetStore() {
    const routeStore = useRouteStore();

    routeStore.$reset();

    resetVueRoutes();

    // 重置状态后需要重新初始化固定路由
    await initConstantRoute();
  }

  /** 重置Vue路由 */
  function resetVueRoutes() {
    removeRouteFns.forEach(fn => fn());
    removeRouteFns.length = 0;
  }

  /** 初始化固定路由 */
  async function initConstantRoute() {
    if (isInitConstantRoute.value) return;

    const staticRoute = createStaticRoutes();

    if (authRouteMode.value === 'static') {
      addConstantRoutes(staticRoute.constantRoutes);
    } else {
      const { data, error } = await fetchGetConstantRoutes();

      if (!error) {
        addConstantRoutes(data);
      } else {
        // 如果获取固定路由失败，使用静态固定路由
        addConstantRoutes(staticRoute.constantRoutes);
      }
    }

    handleConstantAndAuthRoutes();

    setIsInitConstantRoute(true);

    tabStore.initHomeTab();
  }

  /** 初始化权限路由 */
  async function initAuthRoute() {
    // 检查用户信息是否已初始化
    if (!authStore.userInfo.userId) {
      await authStore.initUserInfo();
    }

    if (authRouteMode.value === 'static') {
      initStaticAuthRoute();
    } else {
      await initDynamicAuthRoute();
    }

    tabStore.initHomeTab();
  }

  /** 初始化静态权限路由 */
  function initStaticAuthRoute() {
    const { authRoutes: staticAuthRoutes } = createStaticRoutes();

    if (authStore.isStaticSuper) {
      addAuthRoutes(staticAuthRoutes);
    } else {
      const filteredAuthRoutes = filterAuthRoutesByRoles(staticAuthRoutes, authStore.userInfo.roles);

      addAuthRoutes(filteredAuthRoutes);
    }

    handleConstantAndAuthRoutes();

    setIsInitAuthRoute(true);
  }

  /** 初始化动态权限路由 */
  async function initDynamicAuthRoute() {
    const { data, error } = await fetchGetUserRoutes();

    if (!error) {
      const { routes, home } = data;

      addAuthRoutes(routes);

      handleConstantAndAuthRoutes();

      setRouteHome(home);

      handleUpdateRootRouteRedirect(home);

      setIsInitAuthRoute(true);
    } else {
      // 如果获取用户路由失败，重置状态
      authStore.resetStore();
    }
  }

  /**
   * 处理固定路由和权限路由
   *
   * 1. 合并固定路由和权限路由
   * 2. 根据order排序
   * 3. 转换为Vue路由格式
   * 4. 添加到路由器
   * 5. 生成全局菜单
   * 6. 获取需要缓存的路由
   */
  function handleConstantAndAuthRoutes() {
    const allRoutes = [...constantRoutes.value, ...authRoutes.value];

    const sortRoutes = sortRoutesByOrder(allRoutes);

    const vueRoutes = getAuthVueRoutes(sortRoutes);

    resetVueRoutes();

    addRoutesToVueRouter(vueRoutes);

    getGlobalMenus(sortRoutes);

    getCacheRoutes(vueRoutes);
  }

  /**
   * 添加路由到Vue路由器
   *
   * @param routes - Vue路由配置数组
   */
  function addRoutesToVueRouter(routes: RouteRecordRaw[]) {
    routes.forEach(route => {
      const removeFn = router.addRoute(route);
      addRemoveRouteFn(removeFn);
    });
  }

  /**
   * 添加路由移除函数
   *
   * @param fn - 路由移除函数
   */
  function addRemoveRouteFn(fn: () => void) {
    removeRouteFns.push(fn);
  }

  /**
   * 当权限路由模式为动态时，更新根路由的重定向
   *
   * @param redirectKey - 重定向的路由键名
   */
  function handleUpdateRootRouteRedirect(redirectKey: LastLevelRouteKey) {
    const redirect = getRoutePath(redirectKey);

    if (redirect) {
      const rootRoute: CustomRoute = { ...ROOT_ROUTE, redirect };

      router.removeRoute(rootRoute.name);

      const [rootVueRoute] = getAuthVueRoutes([rootRoute]);

      router.addRoute(rootVueRoute);
    }
  }

  /**
   * 获取权限路由是否存在
   *
   * @param routePath - 路由路径
   */
  async function getIsAuthRouteExist(routePath: RouteMap[RouteKey]) {
    const routeName = getRouteName(routePath);

    if (!routeName) {
      return false;
    }

    if (authRouteMode.value === 'static') {
      const { authRoutes: staticAuthRoutes } = createStaticRoutes();
      return isRouteExistByRouteName(routeName, staticAuthRoutes);
    }

    const { data } = await fetchIsRouteExist(routeName);

    return data;
  }

  /**
   * 获取选中菜单的键路径
   *
   * @param selectedKey - 选中的菜单键
   */
  function getSelectedMenuKeyPath(selectedKey: string) {
    return getSelectedMenuKeyPathByKey(selectedKey, menus.value);
  }

  /** 已登录时的路由切换处理 */
  async function onRouteSwitchWhenLoggedIn() {
    await authStore.initUserInfo();
  }

  /** 未登录时的路由切换处理 */
  async function onRouteSwitchWhenNotLoggedIn() {
    // 一些不需要登录的全局初始化逻辑
  }

  return {
    resetStore,
    routeHome,
    menus,
    searchMenus,
    updateGlobalMenusByLocale,
    cacheRoutes,
    excludeCacheRoutes,
    resetRouteCache,
    breadcrumbs,
    initConstantRoute,
    isInitConstantRoute,
    initAuthRoute,
    isInitAuthRoute,
    setIsInitAuthRoute,
    getIsAuthRouteExist,
    getSelectedMenuKeyPath,
    onRouteSwitchWhenLoggedIn,
    onRouteSwitchWhenNotLoggedIn
  };
});
