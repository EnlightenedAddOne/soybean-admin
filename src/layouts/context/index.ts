import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useContext } from '@sa/hooks';
import { useRouteStore } from '@/store/modules/route';

// 创建混合菜单上下文
export const { setupStore: setupMixMenuContext, useStore: useMixMenuContext } = useContext('mix-menu', useMixMenu);

/**
 * 混合菜单逻辑
 *
 * 1. 管理多级菜单状态
 * 2. 处理菜单层级关系
 * 3. 同步路由变化与菜单选中状态
 */
function useMixMenu() {
  const route = useRoute();
  const routeStore = useRouteStore();
  const { selectedKey } = useMenu();

  // 当前激活的一级菜单key
  const activeFirstLevelMenuKey = ref('');

  /** 设置当前激活的一级菜单 */
  function setActiveFirstLevelMenuKey(key: string) {
    activeFirstLevelMenuKey.value = key;
  }

  /** 根据当前选中菜单自动获取一级菜单key */
  function getActiveFirstLevelMenuKey() {
    const [firstLevelRouteName] = selectedKey.value.split('_');
    setActiveFirstLevelMenuKey(firstLevelRouteName);
  }

  // 所有菜单数据
  const allMenus = computed<App.Global.Menu[]>(() => routeStore.menus);

  // 一级菜单列表（去除子菜单）
  const firstLevelMenus = computed<App.Global.Menu[]>(() =>
    routeStore.menus.map(menu => {
      const { children: _, ...rest } = menu;
      return rest;
    })
  );

  // 当前激活菜单的子级菜单
  const childLevelMenus = computed<App.Global.Menu[]>(
    () => routeStore.menus.find(menu => menu.key === activeFirstLevelMenuKey.value)?.children || []
  );

  // 当前激活的一级菜单是否包含子菜单
  const isActiveFirstLevelMenuHasChildren = computed(() => {
    if (!activeFirstLevelMenuKey.value) return false;
    const findItem = allMenus.value.find(item => item.key === activeFirstLevelMenuKey.value);
    return Boolean(findItem?.children?.length);
  });

  // 监听路由变化更新菜单状态
  watch(
    () => route.name,
    () => {
      getActiveFirstLevelMenuKey();
    },
    { immediate: true }
  );

  return {
    allMenus,
    firstLevelMenus,
    childLevelMenus,
    isActiveFirstLevelMenuHasChildren,
    activeFirstLevelMenuKey,
    setActiveFirstLevelMenuKey,
    getActiveFirstLevelMenuKey
  };
}

/**
 * 菜单相关逻辑
 *
 * 处理当前选中菜单的key
 */
export function useMenu() {
  const route = useRoute();

  // 当前选中的菜单key（考虑隐藏菜单和主动设置激活菜单的情况）
  const selectedKey = computed(() => {
    const { hideInMenu, activeMenu } = route.meta;
    const name = route.name as string;
    return (hideInMenu ? activeMenu : name) || name;
  });

  return {
    selectedKey
  };
}
