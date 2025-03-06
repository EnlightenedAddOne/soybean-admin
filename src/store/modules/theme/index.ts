import { computed, effectScope, onScopeDispose, ref, toRefs, watch } from 'vue';
import type { Ref } from 'vue';
import { defineStore } from 'pinia';
import { useEventListener, usePreferredColorScheme } from '@vueuse/core';
import { getPaletteColorByNumber } from '@sa/color';
import { SetupStoreId } from '@/enum';
import { localStg } from '@/utils/storage';
import {
  addThemeVarsToGlobal,
  createThemeToken,
  getNaiveTheme,
  initThemeSettings,
  toggleAuxiliaryColorModes,
  toggleCssDarkMode
} from './shared';

/** 主题状态管理 */
export const useThemeStore = defineStore(SetupStoreId.Theme, () => {
  // 创建独立的副作用域
  const scope = effectScope();
  // 获取系统主题偏好
  const osTheme = usePreferredColorScheme();

  /** 主题设置 */
  const settings: Ref<App.Theme.ThemeSetting> = ref(initThemeSettings());

  /** 暗黑模式状态 */
  const darkMode = computed(() => {
    if (settings.value.themeScheme === 'auto') {
      return osTheme.value === 'dark';
    }
    return settings.value.themeScheme === 'dark';
  });

  /** 灰度模式状态 */
  const grayscaleMode = computed(() => settings.value.grayscale);

  /** 色弱模式状态 */
  const colourWeaknessMode = computed(() => settings.value.colourWeakness);

  /** 主题颜色集合 */
  const themeColors = computed(() => {
    const { themeColor, otherColor, isInfoFollowPrimary } = settings.value;
    const colors: App.Theme.ThemeColor = {
      primary: themeColor,
      ...otherColor,
      info: isInfoFollowPrimary ? themeColor : otherColor.info
    };
    return colors;
  });

  /** Naive UI 主题配置 */
  const naiveTheme = computed(() => getNaiveTheme(themeColors.value, settings.value.recommendColor));

  /** 主题设置的JSON字符串 用于复制主题配置 */
  const settingsJson = computed(() => JSON.stringify(settings.value));

  /** 重置状态 */
  function resetStore() {
    const themeStore = useThemeStore();
    themeStore.$reset();
  }

  /**
   * 设置主题方案
   *
   * @param themeScheme - 主题方案：'light' | 'dark' | 'auto'
   */
  function setThemeScheme(themeScheme: UnionKey.ThemeScheme) {
    settings.value.themeScheme = themeScheme;
  }

  /**
   * 设置灰度模式
   *
   * @param isGrayscale - 是否启用灰度模式
   */
  function setGrayscale(isGrayscale: boolean) {
    settings.value.grayscale = isGrayscale;
  }

  /**
   * 设置色弱模式
   *
   * @param isColourWeakness - 是否启用色弱模式
   */
  function setColourWeakness(isColourWeakness: boolean) {
    settings.value.colourWeakness = isColourWeakness;
  }

  /** 切换主题方案 在 'light'、'dark'、'auto' 三种方案间循环切换 */
  function toggleThemeScheme() {
    const themeSchemes: UnionKey.ThemeScheme[] = ['light', 'dark', 'auto'];

    const index = themeSchemes.findIndex(item => item === settings.value.themeScheme);
    const nextIndex = index === themeSchemes.length - 1 ? 0 : index + 1;
    const nextThemeScheme = themeSchemes[nextIndex];

    setThemeScheme(nextThemeScheme);
  }

  /**
   * 更新主题颜色
   *
   * @param key - 主题颜色键名
   * @param color - 颜色值
   */
  function updateThemeColors(key: App.Theme.ThemeColorKey, color: string) {
    let colorValue = color;

    if (settings.value.recommendColor) {
      // 根据提供的颜色和颜色名称获取调色板，并使用合适的颜色
      colorValue = getPaletteColorByNumber(color, 500, true);
    }

    if (key === 'primary') {
      settings.value.themeColor = colorValue;
    } else {
      settings.value.otherColor[key] = colorValue;
    }
  }

  /**
   * 设置主题布局
   *
   * @param mode - 布局模式
   */
  function setThemeLayout(mode: UnionKey.ThemeLayoutMode) {
    settings.value.layout.mode = mode;
  }

  /** 设置主题变量到全局样式 */
  function setupThemeVarsToGlobal() {
    const { themeTokens, darkThemeTokens } = createThemeToken(
      themeColors.value,
      settings.value.tokens,
      settings.value.recommendColor
    );
    addThemeVarsToGlobal(themeTokens, darkThemeTokens);
  }

  /**
   * 设置水平混合布局的反转
   *
   * @param reverse - 是否反转水平混合布局
   */
  function setLayoutReverseHorizontalMix(reverse: boolean) {
    settings.value.layout.reverseHorizontalMix = reverse;
  }

  /** 缓存主题设置 */
  function cacheThemeSettings() {
    const isProd = import.meta.env.PROD;

    if (!isProd) return;

    localStg.set('themeSettings', settings.value);
  }

  // 页面关闭或刷新时缓存主题设置
  useEventListener(window, 'beforeunload', () => {
    cacheThemeSettings();
  });

  // 监听状态变化
  scope.run(() => {
    // 监听暗黑模式变化
    watch(
      darkMode,
      val => {
        toggleCssDarkMode(val);
      },
      { immediate: true }
    );

    // 监听灰度模式和色弱模式变化
    watch(
      [grayscaleMode, colourWeaknessMode],
      val => {
        toggleAuxiliaryColorModes(val[0], val[1]);
      },
      { immediate: true }
    );

    // 监听主题颜色变化，更新CSS变量并存储主题颜色
    watch(
      themeColors,
      val => {
        setupThemeVarsToGlobal();
        localStg.set('themeColor', val.primary);
      },
      { immediate: true }
    );
  });

  /** 销毁副作用域 */
  onScopeDispose(() => {
    scope.stop();
  });

  return {
    ...toRefs(settings.value),
    darkMode,
    themeColors,
    naiveTheme,
    settingsJson,
    setGrayscale,
    setColourWeakness,
    resetStore,
    setThemeScheme,
    toggleThemeScheme,
    updateThemeColors,
    setThemeLayout,
    setLayoutReverseHorizontalMix
  };
});
