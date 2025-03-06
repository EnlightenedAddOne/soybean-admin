import { effectScope, nextTick, onScopeDispose, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { breakpointsTailwind, useBreakpoints, useEventListener, useTitle } from '@vueuse/core';
import { useBoolean } from '@sa/hooks';
import { SetupStoreId } from '@/enum';
import { router } from '@/router';
import { $t, setLocale } from '@/locales';
import { setDayjsLocale } from '@/locales/dayjs';
import { localStg } from '@/utils/storage';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { useThemeStore } from '../theme';

/** 应用状态管理 */
export const useAppStore = defineStore(SetupStoreId.App, () => {
  const themeStore = useThemeStore();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const scope = effectScope();
  const breakpoints = useBreakpoints(breakpointsTailwind);

  // 主题抽屉的显示状态
  const { bool: themeDrawerVisible, setTrue: openThemeDrawer, setFalse: closeThemeDrawer } = useBoolean();
  // 页面重载标志
  const { bool: reloadFlag, setBool: setReloadFlag } = useBoolean(true);
  // 全屏内容标志
  const { bool: fullContent, toggle: toggleFullContent } = useBoolean();
  // 内容区域水平滚动状态
  const { bool: contentXScrollable, setBool: setContentXScrollable } = useBoolean();
  // 侧边栏折叠状态
  const { bool: siderCollapse, setBool: setSiderCollapse, toggle: toggleSiderCollapse } = useBoolean();
  // 混合侧边栏固定状态
  const {
    bool: mixSiderFixed,
    setBool: setMixSiderFixed,
    toggle: toggleMixSiderFixed
  } = useBoolean(localStg.get('mixSiderFixed') === 'Y');

  /** 是否为移动端布局 */
  const isMobile = breakpoints.smaller('sm');

  /**
   * 重新加载页面
   *
   * 1. 设置重载标志为false
   * 2. 等待动画时间
   * 3. 恢复重载标志
   * 4. 如果重置策略为refresh，则重置路由缓存
   *
   * @param duration - 重载动画持续时间
   */
  async function reloadPage(duration = 300) {
    setReloadFlag(false);

    const d = themeStore.page.animate ? duration : 40;

    await new Promise(resolve => {
      setTimeout(resolve, d);
    });

    setReloadFlag(true);

    if (themeStore.resetCacheStrategy === 'refresh') {
      routeStore.resetRouteCache();
    }
  }

  /** 当前语言 */
  const locale = ref<App.I18n.LangType>(localStg.get('lang') || 'zh-CN');

  /** 语言选项 */
  const localeOptions: App.I18n.LangOption[] = [
    {
      label: '中文',
      key: 'zh-CN'
    },
    {
      label: 'English',
      key: 'en-US'
    }
  ];

  /**
   * 切换语言
   *
   * @param lang - 目标语言
   */
  function changeLocale(lang: App.I18n.LangType) {
    locale.value = lang;
    setLocale(lang);
    localStg.set('lang', lang);
  }

  /** 根据语言更新文档标题 */
  function updateDocumentTitleByLocale() {
    const { i18nKey, title } = router.currentRoute.value.meta;

    const documentTitle = i18nKey ? $t(i18nKey) : title;

    useTitle(documentTitle);
  }

  /** 初始化应用 */
  function init() {
    setDayjsLocale(locale.value);
  }

  // 监听状态变化
  scope.run(() => {
    // 监听移动端状态，如果是移动端则折叠侧边栏
    watch(
      isMobile,
      newValue => {
        if (newValue) {
          // 在切换到移动端前备份主题设置
          localStg.set('backupThemeSettingBeforeIsMobile', {
            layout: themeStore.layout.mode,
            siderCollapse: siderCollapse.value
          });

          themeStore.setThemeLayout('vertical');
          setSiderCollapse(true);
        } else {
          // 切换回桌面端时恢复备份的主题设置
          const backup = localStg.get('backupThemeSettingBeforeIsMobile');

          if (backup) {
            nextTick(() => {
              themeStore.setThemeLayout(backup.layout);
              setSiderCollapse(backup.siderCollapse);

              localStg.remove('backupThemeSettingBeforeIsMobile');
            });
          }
        }
      },
      { immediate: true }
    );

    // 监听语言变化
    watch(locale, () => {
      // 更新文档标题
      updateDocumentTitleByLocale();

      // 更新全局菜单
      routeStore.updateGlobalMenusByLocale();

      // 更新标签页
      tabStore.updateTabsByLocale();

      // 设置dayjs的语言
      setDayjsLocale(locale.value);
    });
  });

  // 缓存混合侧边栏固定状态
  useEventListener(window, 'beforeunload', () => {
    localStg.set('mixSiderFixed', mixSiderFixed.value ? 'Y' : 'N');
  });

  /** 销毁副作用域 */
  onScopeDispose(() => {
    scope.stop();
  });

  // 初始化
  init();

  return {
    isMobile,
    reloadFlag,
    reloadPage,
    fullContent,
    locale,
    localeOptions,
    changeLocale,
    themeDrawerVisible,
    openThemeDrawer,
    closeThemeDrawer,
    toggleFullContent,
    contentXScrollable,
    setContentXScrollable,
    siderCollapse,
    setSiderCollapse,
    toggleSiderCollapse,
    mixSiderFixed,
    setMixSiderFixed,
    toggleMixSiderFixed
  };
});
