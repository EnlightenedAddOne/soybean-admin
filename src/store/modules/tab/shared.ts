import type { Router } from 'vue-router';
import type { LastLevelRouteKey, RouteKey, RouteMap } from '@elegant-router/types';
import { $t } from '@/locales';
import { getRoutePath } from '@/router/elegant/transform';

/**
 * 获取所有标签页
 *
 * 1. 过滤出固定标签和普通标签
 * 2. 固定标签按照fixedIndex排序
 * 3. 组合首页标签、固定标签和普通标签
 * 4. 更新标签的显示文本
 *
 * @param tabs - 标签页数组
 * @param homeTab - 首页标签
 */
export function getAllTabs(tabs: App.Global.Tab[], homeTab?: App.Global.Tab) {
  if (!homeTab) {
    return [];
  }

  const filterHomeTabs = tabs.filter(tab => tab.id !== homeTab.id);

  const fixedTabs = filterHomeTabs.filter(isFixedTab).sort((a, b) => a.fixedIndex! - b.fixedIndex!);

  const remainTabs = filterHomeTabs.filter(tab => !isFixedTab(tab));

  const allTabs = [homeTab, ...fixedTabs, ...remainTabs];

  return updateTabsLabel(allTabs);
}

/**
 * 判断是否为固定标签
 *
 * @param tab - 标签页对象
 * @returns 如果标签页有fixedIndex属性则返回true
 */
function isFixedTab(tab: App.Global.Tab) {
  return tab.fixedIndex !== undefined && tab.fixedIndex !== null;
}

/**
 * 根据路由获取标签页ID
 *
 * 1. 普通页面：使用路径作为ID
 * 2. 多标签页面：使用路径加查询参数作为ID
 *
 * @param route - 路由对象
 * @returns 标签页ID
 */
export function getTabIdByRoute(route: App.Global.TabRoute) {
  const { path, query = {}, meta } = route;

  let id = path;

  if (meta.multiTab) {
    const queryKeys = Object.keys(query).sort();
    const qs = queryKeys.map(key => `${key}=${query[key]}`).join('&');

    id = `${path}?${qs}`;
  }

  return id;
}

/**
 * 根据路由信息创建标签页对象
 *
 * 包含标签页的基本信息：
 *
 * - ID、标题、路由键名
 * - 路由路径、完整路径
 * - 固定索引、图标信息
 * - 国际化键名
 *
 * @param route - 路由对象
 * @returns 标签页对象
 */
export function getTabByRoute(route: App.Global.TabRoute) {
  const { name, path, fullPath = path, meta } = route;

  const { title, i18nKey, fixedIndexInTab } = meta;

  // 获取路由的图标信息
  const { icon, localIcon } = getRouteIcons(route);

  const label = i18nKey ? $t(i18nKey) : title;

  const tab: App.Global.Tab = {
    id: getTabIdByRoute(route),
    label,
    routeKey: name as LastLevelRouteKey,
    routePath: path as RouteMap[LastLevelRouteKey],
    fullPath,
    fixedIndex: fixedIndexInTab,
    icon,
    localIcon,
    i18nKey
  };

  return tab;
}

/**
 * 获取路由的图标信息
 *
 * Vue Router会自动合并所有匹配项的meta信息， 这里需要单独处理图标信息以避受其他匹配项的影响
 *
 * @param route - 路由对象
 * @returns 图标信息对象
 */
export function getRouteIcons(route: App.Global.TabRoute) {
  // 设置图标的默认值
  let icon: string = route?.meta?.icon || import.meta.env.VITE_MENU_ICON;
  let localIcon: string | undefined = route?.meta?.localIcon;

  // 当存在多个匹配项时才会有route.matched
  if (route.matched) {
    // 从matched中找到当前路由的meta信息
    const currentRoute = route.matched.find(r => r.name === route.name);
    // 如果在currentRoute.meta中存在icon，则覆盖默认值
    icon = currentRoute?.meta?.icon || icon;
    localIcon = currentRoute?.meta?.localIcon;
  }

  return { icon, localIcon };
}

/**
 * 获取默认的首页标签
 *
 * @param router - 路由实例
 * @param homeRouteName - 首页路由名称
 * @returns 首页标签对象
 */
export function getDefaultHomeTab(router: Router, homeRouteName: LastLevelRouteKey) {
  const homeRoutePath = getRoutePath(homeRouteName);
  const i18nLabel = $t(`route.${homeRouteName}`);

  let homeTab: App.Global.Tab = {
    id: getRoutePath(homeRouteName),
    label: i18nLabel || homeRouteName,
    routeKey: homeRouteName,
    routePath: homeRoutePath,
    fullPath: homeRoutePath
  };

  const routes = router.getRoutes();
  const homeRoute = routes.find(route => route.name === homeRouteName);
  if (homeRoute) {
    homeTab = getTabByRoute(homeRoute);
  }

  return homeTab;
}

/**
 * 检查标签页是否存在于标签页数组中
 *
 * @param tabId - 标签页ID
 * @param tabs - 标签页数组
 */
export function isTabInTabs(tabId: string, tabs: App.Global.Tab[]) {
  return tabs.some(tab => tab.id === tabId);
}

/**
 * 根据ID过滤标签页
 *
 * @param tabId - 要过滤的标签页ID
 * @param tabs - 标签页数组
 * @returns 过滤后的标签页数组
 */
export function filterTabsById(tabId: string, tabs: App.Global.Tab[]) {
  return tabs.filter(tab => tab.id !== tabId);
}

/**
 * 根据ID数组过滤标签页
 *
 * @param tabIds - 要过滤的标签页ID数组
 * @param tabs - 标签页数组
 * @returns 过滤后的标签页数组
 */
export function filterTabsByIds(tabIds: string[], tabs: App.Global.Tab[]) {
  return tabs.filter(tab => !tabIds.includes(tab.id));
}

/**
 * 根据所有路由提取有效的标签页
 *
 * @param router - 路由实例
 * @param tabs - 标签页数组
 * @returns 有效的标签页数组
 */
export function extractTabsByAllRoutes(router: Router, tabs: App.Global.Tab[]) {
  const routes = router.getRoutes();
  const routeNames = routes.map(route => route.name);
  return tabs.filter(tab => routeNames.includes(tab.routeKey));
}

/**
 * 获取固定的标签页
 *
 * @param tabs - 标签页数组
 * @returns 固定的标签页数组
 */
export function getFixedTabs(tabs: App.Global.Tab[]) {
  return tabs.filter(isFixedTab);
}

/**
 * 获取固定标签页的ID数组
 *
 * @param tabs - 标签页数组
 * @returns 固定标签页的ID数组
 */
export function getFixedTabIds(tabs: App.Global.Tab[]) {
  const fixedTabs = getFixedTabs(tabs);
  return fixedTabs.map(tab => tab.id);
}

/**
 * 更新标签页的显示文本
 *
 * @param tabs - 标签页数组
 * @returns 更新后的标签页数组
 */
function updateTabsLabel(tabs: App.Global.Tab[]) {
  const updated = tabs.map(tab => ({
    ...tab,
    label: tab.newLabel || tab.oldLabel || tab.label
  }));

  return updated;
}

/**
 * 根据国际化键名更新单个标签页
 *
 * @param tab - 标签页对象
 * @returns 更新后的标签页对象
 */
export function updateTabByI18nKey(tab: App.Global.Tab) {
  const { i18nKey, label } = tab;

  return {
    ...tab,
    label: i18nKey ? $t(i18nKey) : label
  };
}

/**
 * 根据国际化键名更新所有标签页
 *
 * @param tabs - 标签页数组
 * @returns 更新后的标签页数组
 */
export function updateTabsByI18nKey(tabs: App.Global.Tab[]) {
  return tabs.map(tab => updateTabByI18nKey(tab));
}

/**
 * 根据路由名称查找标签页
 *
 * @param name - 路由名称
 * @param tabs - 标签页数组
 * @returns 找到的标签页对象
 */
export function findTabByRouteName(name: RouteKey, tabs: App.Global.Tab[]) {
  const routePath = getRoutePath(name);

  const tabId = routePath;
  const multiTabId = `${routePath}?`;

  return tabs.find(tab => tab.id === tabId || tab.id.startsWith(multiTabId));
}
