import { computed, effectScope, onScopeDispose, ref, watch } from 'vue';
import { useElementSize } from '@vueuse/core';
import VChart, { registerLiquidChart } from '@visactor/vchart';
import type { ISpec, ITheme } from '@visactor/vchart';
import light from '@visactor/vchart-theme/public/light.json';
import dark from '@visactor/vchart-theme/public/dark.json';
import { useThemeStore } from '@/store/modules/theme';

// 注册液态图表类型
registerLiquidChart();

// 注册主题
VChart.ThemeManager.registerTheme('light', light as ITheme);
VChart.ThemeManager.registerTheme('dark', dark as ITheme);

interface ChartHooks {
  onRender?: (chart: VChart) => void | Promise<void>;
  onUpdated?: (chart: VChart) => void | Promise<void>;
  onDestroy?: (chart: VChart) => void | Promise<void>;
}

/**
 * 使用VChart图表的Hook
 *
 * @param specFactory - 图表配置生成函数
 * @param hooks - 图表生命周期钩子
 * @returns 图表DOM引用和操作方法
 */
export function useVChart<T extends ISpec>(specFactory: () => T, hooks: ChartHooks = {}) {
  const scope = effectScope(); // 创建一个独立的响应式作用域
  const themeStore = useThemeStore();
  const darkMode = computed(() => themeStore.darkMode); // 计算属性：当前是否为暗黑模式

  const domRef = ref<HTMLElement | null>(null); // 图表容器的DOM引用
  const initialSize = { width: 0, height: 0 }; // 初始尺寸
  const { width, height } = useElementSize(domRef, initialSize); // 监听元素尺寸变化

  let chart: VChart | null = null; // 图表实例
  const spec: T = specFactory(); // 生成图表配置

  const { onRender, onUpdated, onDestroy } = hooks;

  /** 判断是否可以渲染图表 当domRef已准备好且初始尺寸有效时返回true */
  function canRender() {
    return domRef.value && initialSize.width > 0 && initialSize.height > 0;
  }

  /** 判断图表是否已渲染 */
  function isRendered() {
    return Boolean(domRef.value && chart);
  }

  /**
   * 更新图表配置
   *
   * @param callback - 配置更新回调函数
   */
  async function updateSpec(callback: (opts: T, optsFactory: () => T) => ISpec = () => spec) {
    if (!isRendered()) return;

    const updatedOpts = callback(spec, specFactory);

    Object.assign(spec, updatedOpts);

    if (isRendered()) {
      chart?.release();
    }

    chart?.updateSpec({ ...updatedOpts }, true);

    await onUpdated?.(chart!);
  }

  /** 设置新的图表配置 */
  function setSpec(newSpec: T) {
    chart?.updateSpec(newSpec);
  }

  /** 渲染图表 */
  async function render() {
    if (!isRendered()) {
      // 应用主题
      if (darkMode.value) {
        VChart.ThemeManager.setCurrentTheme('dark');
      } else {
        VChart.ThemeManager.setCurrentTheme('light');
      }

      chart = new VChart(spec, { dom: domRef.value as HTMLElement });
      chart.renderSync();

      await onRender?.(chart);
    }
  }

  /** 调整图表尺寸 */
  function resize() {
    // chart?.resize();
  }

  /** 销毁图表 */
  async function destroy() {
    if (!chart) return;

    await onDestroy?.(chart);
    chart?.release();
    chart = null;
  }

  /** 切换图表主题 */
  async function changeTheme() {
    await destroy();
    await render();
    await onUpdated?.(chart!);
  }

  /**
   * 根据尺寸渲染图表
   *
   * @param w - 宽度
   * @param h - 高度
   */
  async function renderChartBySize(w: number, h: number) {
    initialSize.width = w;
    initialSize.height = h;

    // 尺寸异常时销毁图表
    if (!canRender()) {
      await destroy();
      return;
    }

    // 调整图表尺寸
    if (isRendered()) {
      resize();
    }

    // 渲染图表
    await render();
  }

  // 监听尺寸和主题变化
  scope.run(() => {
    watch([width, height], ([newWidth, newHeight]) => {
      renderChartBySize(newWidth, newHeight);
    });

    watch(darkMode, () => {
      changeTheme();
    });
  });

  // 作用域销毁时清理资源
  onScopeDispose(() => {
    destroy();
    scope.stop();
  });

  return {
    domRef,
    updateSpec,
    setSpec
  };
}
