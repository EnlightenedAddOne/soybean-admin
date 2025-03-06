<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { AdminLayout, LAYOUT_SCROLL_EL_ID } from '@sa/materials';
import type { LayoutMode } from '@sa/materials';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import GlobalHeader from '../modules/global-header/index.vue';
import GlobalSider from '../modules/global-sider/index.vue';
import GlobalTab from '../modules/global-tab/index.vue';
import GlobalContent from '../modules/global-content/index.vue';
import GlobalFooter from '../modules/global-footer/index.vue';
import ThemeDrawer from '../modules/theme-drawer/index.vue';
import { setupMixMenuContext } from '../context';

// 定义组件名称为BaseLayout
defineOptions({
  name: 'BaseLayout'
});

// 状态管理
const appStore = useAppStore();
const themeStore = useThemeStore();
const { childLevelMenus, isActiveFirstLevelMenuHasChildren } = setupMixMenuContext();

// 异步加载全局菜单组件
const GlobalMenu = defineAsyncComponent(() => import('../modules/global-menu/index.vue'));

/** 计算布局模式 vertical: 垂直模式 horizontal: 水平模式 */
const layoutMode = computed(() => {
  const vertical: LayoutMode = 'vertical';
  const horizontal: LayoutMode = 'horizontal';
  return themeStore.layout.mode.includes(vertical) ? vertical : horizontal;
});

/** 头部组件属性配置 根据不同的布局模式返回对应的配置 */
const headerProps = computed(() => {
  const { mode, reverseHorizontalMix } = themeStore.layout;

  const headerPropsConfig: Record<UnionKey.ThemeLayoutMode, App.Global.HeaderProps> = {
    vertical: {
      // 垂直布局
      showLogo: false,
      showMenu: false,
      showMenuToggler: true
    },
    'vertical-mix': {
      // 垂直混合布局
      showLogo: false,
      showMenu: false,
      showMenuToggler: false
    },
    horizontal: {
      // 水平布局
      showLogo: true,
      showMenu: true,
      showMenuToggler: false
    },
    'horizontal-mix': {
      // 水平混合布局
      showLogo: true,
      showMenu: true,
      showMenuToggler: reverseHorizontalMix && isActiveFirstLevelMenuHasChildren.value
    }
  };

  return headerPropsConfig[mode];
});

// 侧边栏可见性（水平布局时隐藏侧边栏）
const siderVisible = computed(() => themeStore.layout.mode !== 'horizontal');

// 布局模式判断
const isVerticalMix = computed(() => themeStore.layout.mode === 'vertical-mix');
const isHorizontalMix = computed(() => themeStore.layout.mode === 'horizontal-mix');

// 侧边栏宽度计算
const siderWidth = computed(() => getSiderWidth());
const siderCollapsedWidth = computed(() => getSiderCollapsedWidth());

/** 计算侧边栏展开宽度 处理混合布局下的特殊宽度计算 */
function getSiderWidth() {
  const { reverseHorizontalMix } = themeStore.layout;
  const { width, mixWidth, mixChildMenuWidth } = themeStore.sider;

  // 水平混合布局反向模式处理
  if (isHorizontalMix.value && reverseHorizontalMix) {
    return isActiveFirstLevelMenuHasChildren.value ? width : 0;
  }

  // 基础宽度计算
  let w = isVerticalMix.value || isHorizontalMix.value ? mixWidth : width;

  // 垂直混合布局固定侧边栏时增加子菜单宽度
  if (isVerticalMix.value && appStore.mixSiderFixed && childLevelMenus.value.length) {
    w += mixChildMenuWidth;
  }

  return w;
}

/** 计算侧边栏折叠宽度 处理不同布局模式下的折叠状态宽度 */
function getSiderCollapsedWidth() {
  const { reverseHorizontalMix } = themeStore.layout;
  const { collapsedWidth, mixCollapsedWidth, mixChildMenuWidth } = themeStore.sider;

  // 水平混合布局反向模式处理
  if (isHorizontalMix.value && reverseHorizontalMix) {
    return isActiveFirstLevelMenuHasChildren.value ? collapsedWidth : 0;
  }

  // 基础折叠宽度计算
  let w = isVerticalMix.value || isHorizontalMix.value ? mixCollapsedWidth : collapsedWidth;

  // 垂直混合布局固定侧边栏时增加子菜单宽度
  if (isVerticalMix.value && appStore.mixSiderFixed && childLevelMenus.value.length) {
    w += mixChildMenuWidth;
  }

  return w;
}
</script>

<template>
  <!-- 主布局容器 -->
  <AdminLayout
    v-model:sider-collapse="appStore.siderCollapse"
    :mode="layoutMode"
    :scroll-el-id="LAYOUT_SCROLL_EL_ID"
    :scroll-mode="themeStore.layout.scrollMode"
    :is-mobile="appStore.isMobile"
    :full-content="appStore.fullContent"
    :fixed-top="themeStore.fixedHeaderAndTab"
    :header-height="themeStore.header.height"
    :tab-visible="themeStore.tab.visible"
    :tab-height="themeStore.tab.height"
    :content-class="appStore.contentXScrollable ? 'overflow-x-hidden' : ''"
    :sider-visible="siderVisible"
    :sider-width="siderWidth"
    :sider-collapsed-width="siderCollapsedWidth"
    :footer-visible="themeStore.footer.visible"
    :footer-height="themeStore.footer.height"
    :fixed-footer="themeStore.footer.fixed"
    :right-footer="themeStore.footer.right"
  >
    <!-- 头部插槽 -->
    <template #header>
      <GlobalHeader v-bind="headerProps" />
    </template>

    <!-- 标签页插槽 -->
    <template #tab>
      <GlobalTab />
    </template>

    <!-- 侧边栏插槽 -->
    <template #sider>
      <GlobalSider />
    </template>

    <!-- 全局菜单 -->
    <GlobalMenu />

    <!-- 内容区域 -->
    <GlobalContent />

    <!-- 主题抽屉 -->
    <ThemeDrawer />

    <!-- 页脚插槽 -->
    <template #footer>
      <GlobalFooter />
    </template>
  </AdminLayout>
</template>

<style lang="scss">
/* 滚动容器样式 */
#__SCROLL_EL_ID__ {
  @include scrollbar(); // 引入滚动条样式混合
}
</style>
